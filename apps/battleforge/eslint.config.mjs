import nextConfig from "@battlewithbytes/eslint-config/next";

export default [
  ...nextConfig,
  {
    rules: {
      // Pre-existing debt in this app, kept visible as warnings rather
      // than blocking: raw <img> usage and unescaped entities in JSX.
      "react/no-unescaped-entities": "warn",
      "@next/next/no-img-element": "warn",
    },
  },
];
