import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Relax unused vars rule - many files have reserved functions for future use
      "@typescript-eslint/no-unused-vars": "warn",
      // Relax some rules for initial development
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "warn",
      "@next/next/no-img-element": "warn",
      "prefer-const": "warn",
      // Allow hooks in any function during development
      "react-hooks/rules-of-hooks": "warn",
    }
  }
];

export default eslintConfig;
