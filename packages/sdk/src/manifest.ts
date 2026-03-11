interface ManifestInput {
  id: string;
  name: string;
  version: string;
  type: "tool" | "suite" | "agent-pack" | "connector" | "app";
  description: string;
  author: string;
  [key: string]: unknown;
}

export function createManifest(input: ManifestInput): string {
  return JSON.stringify(input, null, 2);
}
