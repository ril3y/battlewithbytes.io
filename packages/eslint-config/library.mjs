import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

/** Shared flat config for TypeScript library packages (React or plain). */
const libraryConfig = [
  {
    ignores: ["node_modules/**", "dist/**", "coverage/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.tsx", "**/*.jsx"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      // rules-of-hooks catches genuine correctness bugs (conditional or
      // out-of-order hook calls), so it must never be a warning
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
  {
    rules: {
      // These gate the build. The repo is at zero warnings; if a rule
      // genuinely must be broken, use a targeted
      // eslint-disable-next-line with a `-- reason` explaining why,
      // rather than demoting the rule for everyone.
      // A leading underscore marks a binding as intentionally unused
      // (positional params, destructured slots, ignored catch bindings)
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "prefer-const": "error",
    },
  },
];

export default libraryConfig;
