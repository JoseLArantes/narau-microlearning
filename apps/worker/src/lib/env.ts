import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  WIKIPEDIA_USER_AGENT: z.string().min(1),
  STORAGE_ENABLED: z.string().default("false"),
  STORAGE_ENDPOINT: z.string().default("http://localhost:9000"),
  STORAGE_ACCESS_KEY: z.string().default("minioadmin"),
  STORAGE_SECRET_KEY: z.string().default("minioadmin"),
  STORAGE_BUCKET: z.string().default("narau"),
  STORAGE_REGION: z.string().default("us-east-1"),
  STORAGE_PUBLIC_BASE_URL: z.string().default("http://localhost:9000/narau"),
});

export type WorkerEnv = z.infer<typeof envSchema>;

export const env: WorkerEnv = envSchema.parse(process.env);
