import { createLintConfig } from "@narau/config/eslint";

export default createLintConfig({ react: true, ignores: ["next-env.d.ts", ".next/**"] });
