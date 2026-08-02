import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __dirname = dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** Shared flat config for Next.js apps in the monorepo. */
const nextConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "jest.config.js",
      "jest.setup.js",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
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
      "react-hooks/exhaustive-deps": "error",
    },
  },
];

export default nextConfig;
