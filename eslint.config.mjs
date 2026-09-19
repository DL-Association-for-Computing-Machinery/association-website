import js from "@eslint/js";
import prettier from "eslint-config-prettier/flat";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "**/dist/**",
      "**/coverage/**",
      "draft_*/**",
      ".scratch/**",
      ".playwright-cli/**",
      "**/next-env.d.ts",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}"],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ["**/*.{ts,mts,cts,tsx}"],
    extends: [...tseslint.configs.recommended],
  },
  {
    files: ["**/*.config.{js,mjs,cjs,ts,mts,cts}", "scripts/**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: { globals: globals.node },
  },
  prettier,
);
