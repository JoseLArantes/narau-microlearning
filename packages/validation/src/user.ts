import z from "zod";

export const roleSchema = z.enum(["USER", "ADMIN", "MODERATOR"]);
export const userStatusSchema = z.enum(["INVITED", "ACTIVE", "DISABLED"]);

export const createUserSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  email: z.string().email(),
  role: roleSchema.optional(),
  status: userStatusSchema.optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const assignLearningInterestsSchema = z.object({
  userId: z.string().min(1),
  selectedNodeIds: z.array(z.string().min(1)).min(1).max(100),
});

export type AssignLearningInterestsInput = z.infer<typeof assignLearningInterestsSchema>;
