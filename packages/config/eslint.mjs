import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

/**
 * Creates a flat ESLint configuration for a workspace package.
 *
 * @param {object} options
 * @param {string[]} [options.ignores] - Extra globs to ignore (e.g. build output).
 * @param {boolean} [options.react] - Enable React hooks rules.
 * @returns {import("eslint").Linter.Config[]}
 */
export function createLintConfig({ ignores = [], react = false } = {}) {
  return tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
      ignores: ["dist/**", ".next/**", "node_modules/**", "coverage/**", ...ignores],
    },
    {
      rules: {
        "@typescript-eslint/no-explicit-any": ["error", { ignoreRestArgs: false }],
        "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
        "@typescript-eslint/explicit-function-return-type": [
          "error",
          { allowExpressions: true, allowTypedFunctionExpressions: true },
        ],
        "no-console": ["error", { allow: ["info", "warn", "error"] }],
      },
    },
    ...(react ? [reactHooks.configs["recommended-latest"]] : []),
    prettier,
  );
}

export default createLintConfig;
