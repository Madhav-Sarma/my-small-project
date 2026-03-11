import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatRequest, ChatResponse } from "../types.js";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY ?? "");

export async function googleChat(req: ChatRequest): Promise<ChatResponse> {
  const model = genAI.getGenerativeModel({ model: req.model });

  const history = req.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const lastMessage = history.pop();
  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastMessage?.parts[0].text ?? "");
  const response = result.response;

  return {
    id: `google-${Date.now()}`,
    model: req.model,
    provider: "google",
    content: response.text(),
    usage: {
      inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
      outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
      totalTokens: response.usageMetadata?.totalTokenCount ?? 0,
    },
  };
}
