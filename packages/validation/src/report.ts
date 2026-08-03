import { z } from "zod";

export const reportReasonSchema = z.enum([
  "INACCURATE",
  "OUTDATED",
  "OFFENSIVE",
  "MISLEADING_SUMMARY",
  "BROKEN_SOURCE",
  "COPYRIGHT",
  "OTHER",
]);

export const reportSchema = z.object({
  subjectId: z.string().min(1),
  itemId: z.string().optional(),
  reason: reportReasonSchema,
  details: z.string().max(2000).optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;
