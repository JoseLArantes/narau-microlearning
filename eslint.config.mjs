import { createLintConfig } from "@narau/config/eslint";

export default createLintConfig({ ignores: ["pnpm-lock.yaml", "docs/**"] });
