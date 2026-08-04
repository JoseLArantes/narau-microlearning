import { createLintConfig } from "@narau/config/eslint";

export default createLintConfig({ ignores: ["prisma/migrations/**"] });
