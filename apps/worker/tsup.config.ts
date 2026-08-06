import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/cli.ts"],
  format: ["esm"],
  target: "node20",
  clean: true,
  sourcemap: true,
  external: ["@prisma/client", "nodemailer"],
  noExternal: [
    "@aws-sdk/client-s3",
    "@narau/content-normalizer",
    "@narau/database",
    "@narau/email",
    "@narau/validation",
    "@narau/wikipedia-client",
    "bullmq",
    "cheerio",
    "dotenv",
    "ioredis",
    "p-limit",
    "p-retry",
    "sanitize-html",
    "zod",
  ],
});
