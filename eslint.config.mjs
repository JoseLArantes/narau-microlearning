import { createLintConfig } from "@dailycurio/config/eslint";

export default createLintConfig({ ignores: ["pnpm-lock.yaml", "docs/**"] });
