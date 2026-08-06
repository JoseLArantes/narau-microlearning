import { describe, expect, it, vi } from "vitest";
import { createJobProcessor } from "./job-dispatcher";

describe("worker job dispatcher", () => {
  it("runs only the processor registered for the queued job name", async () => {
    const ingest = vi.fn().mockResolvedValue("ingested");
    const select = vi.fn().mockResolvedValue("selected");
    const process = createJobProcessor({ ingest, select });

    await expect(process({ name: "select", data: { date: "2026-08-06" } })).resolves.toBe(
      "selected",
    );
    expect(select).toHaveBeenCalledOnce();
    expect(ingest).not.toHaveBeenCalled();
  });

  it("rejects unknown job names instead of running an unrelated processor", async () => {
    const process = createJobProcessor({ ingest: vi.fn() });

    await expect(process({ name: "unknown", data: {} })).rejects.toThrow(
      "Unknown worker job: unknown",
    );
  });
});
