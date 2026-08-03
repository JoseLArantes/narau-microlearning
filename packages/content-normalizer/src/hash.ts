import { createHash } from "node:crypto";

function stableSerialize(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`;
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, val]) => `${JSON.stringify(key)}:${stableSerialize(val)}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value);
}

export function createContentHash(input: unknown): string {
  return createHash("sha256").update(stableSerialize(input)).digest("hex");
}
