export interface SuiteDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  tools: string[];
  pricing: { model: "free" | "one_time" | "subscription"; price?: number };
}

export function defineSuite(definition: SuiteDefinition): SuiteDefinition {
  return definition;
}
