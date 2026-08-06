CREATE TYPE "LlmProvider" AS ENUM ('OPENAI', 'DEEPSEEK', 'GEMINI');

ALTER TABLE "AppSettings"
ADD COLUMN "llmProvider" "LlmProvider" NOT NULL DEFAULT 'OPENAI',
DROP COLUMN "llmBaseUrl";

ALTER TABLE "DailyAreaSubject"
ADD COLUMN "curationProvider" "LlmProvider";
