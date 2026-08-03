import { z } from "zod";

export const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const overrideDailySubjectSchema = z.object({
  contentDate: dateStringSchema,
  areaId: z.string().min(1),
  subjectId: z.string().min(1),
});

export type OverrideDailySubjectInput = z.infer<typeof overrideDailySubjectSchema>;
