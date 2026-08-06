import z from "zod";

export const llmProviderSchema = z.enum(["OPENAI", "DEEPSEEK", "GEMINI"]);

export const llmSettingsSchema = z
  .object({
    enabled: z.boolean(),
    provider: llmProviderSchema,
    model: z.string().trim().max(200),
    apiKey: z.string().trim().max(1000).optional(),
  })
  .superRefine((value, context) => {
    if (!value.enabled) return;
    if (!value.model)
      context.addIssue({ code: "custom", path: ["model"], message: "Model ID is required." });
  });

export type LlmProviderInput = z.infer<typeof llmProviderSchema>;
export type LlmSettingsInput = z.infer<typeof llmSettingsSchema>;
