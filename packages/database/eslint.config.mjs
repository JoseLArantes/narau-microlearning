import { createLintConfig } from "@dailycurio/config/eslint";

export default createLintConfig({ ignores: ["prisma/migrations/**"] });
