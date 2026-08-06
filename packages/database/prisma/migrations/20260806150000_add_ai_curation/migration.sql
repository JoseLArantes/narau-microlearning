CREATE TYPE "AiCurationStatus" AS ENUM ('NOT_REQUESTED', 'PENDING', 'CURATED', 'FAILED');

ALTER TABLE "AppSettings"
ADD COLUMN "llmEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "llmBaseUrl" TEXT,
ADD COLUMN "llmModel" TEXT,
ADD COLUMN "llmApiKeyEncrypted" TEXT,
ADD COLUMN "llmApiKeyHint" TEXT;

ALTER TABLE "DailyAreaSubject"
ADD COLUMN "curationStatus" "AiCurationStatus" NOT NULL DEFAULT 'NOT_REQUESTED',
ADD COLUMN "curatedText" TEXT,
ADD COLUMN "curatedHook" TEXT,
ADD COLUMN "curationModel" TEXT,
ADD COLUMN "curationPromptVersion" TEXT,
ADD COLUMN "curationSourceRevisionId" TEXT,
ADD COLUMN "curatedAt" TIMESTAMP(3),
ADD COLUMN "curationError" TEXT;
