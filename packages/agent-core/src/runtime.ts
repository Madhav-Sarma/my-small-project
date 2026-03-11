import type { ToolRuntimeEngine } from "@aios/tool-runtime";
import type { ToolConfig, ToolInput, ExecutionContext } from "@aios/tool-runtime";
import { AgentMemoryStore } from "./memory.js";
import type { AgentConfig, AgentStep, AgentResult, AgentMessage } from "./types.js";

/** Minimal interface for the AI gateway client used by agents. */
export interface AIGatewayClient {
  chat(params: {
    model: string;
    messages: AgentMessage[];
    tools?: string[];
  }): Promise<{
    content: string;
    tokensUsed: number;
    reasoning?: string;
    toolCall?: { toolId: string; input: Record<string, unknown> };
  }>;
}

/** Function that resolves a tool configuration by ID (e.g. from a database). */
export type ToolConfigResolver = (toolId: string) => Promise<ToolConfig | null>;

/**
 * Core agent runtime — iterative tool-using agent loop.
 *
 * Flow:
 *   1. Receive goal
 *   2. Plan next action (call AI model)
 *   3. Execute tool if needed
 *   4. Store result in memory
 *   5. Repeat until goal is met or max iterations
 */
export class AgentRuntime {
  private memory = new AgentMemoryStore();

  constructor(
    private toolEngine: ToolRuntimeEngine,
    private aiGateway: AIGatewayClient,
    private toolResolver?: ToolConfigResolver,
  ) {}

  async run(config: AgentConfig, userInput: string, context: ExecutionContext): Promise<AgentResult> {
    const steps: AgentStep[] = [];
    let totalTokens = 0;

    const messages: AgentMessage[] = [
      { role: "system", content: config.systemPrompt },
      { role: "user", content: `Goal: ${config.goal}\n\nUser input: ${userInput}` },
    ];

    // Add memory context
    if (config.memoryEnabled) {
      const mem = this.memory.getAll(config.agentId);
      if (Object.keys(mem).length > 0) {
        messages.push({ role: "system", content: `Agent memory:\n${JSON.stringify(mem)}` });
      }
    }

    for (let i = 0; i < config.maxIterations; i++) {
      // Call AI model for next action
      const response = await this.aiGateway.chat({
        model: config.model,
        messages,
        tools: config.toolIds,
      });

      totalTokens += response.tokensUsed;

      // Check if agent wants to use a tool
      if (response.toolCall) {
        const step: AgentStep = {
          iteration: i + 1,
          action: "tool_call",
          toolId: response.toolCall.toolId,
          input: response.toolCall.input,
          reasoning: response.reasoning ?? "",
        };

        // Execute the tool
        const toolConfig = await this.resolveToolConfig(response.toolCall.toolId);
        if (toolConfig) {
          const result = await this.toolEngine.execute(
            toolConfig,
            { parameters: response.toolCall.input },
            context,
          );
          step.output = result.output?.data;

          // Store result in memory
          if (config.memoryEnabled) {
            this.memory.set(config.agentId, `step_${i}`, JSON.stringify(step.output));
          }

          messages.push({
            role: "tool",
            content: JSON.stringify(result.output?.data),
            toolCallId: response.toolCall.toolId,
          });
        }

        steps.push(step);
      } else {
        // Agent is done — final answer
        steps.push({
          iteration: i + 1,
          action: "final_answer",
          reasoning: response.content,
        });

        return {
          success: true,
          agentId: config.agentId,
          iterations: i + 1,
          steps,
          finalOutput: response.content,
          tokensUsed: totalTokens,
        };
      }
    }

    // Max iterations reached
    return {
      success: false,
      agentId: config.agentId,
      iterations: config.maxIterations,
      steps,
      finalOutput: "Max iterations reached",
      tokensUsed: totalTokens,
      error: "Agent exceeded maximum iterations",
    };
  }

  private async resolveToolConfig(toolId: string): Promise<ToolConfig | null> {
    if (this.toolResolver) return this.toolResolver(toolId);
    return null;
  }
}
