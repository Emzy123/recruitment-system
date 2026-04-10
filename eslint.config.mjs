import nextVitals from "eslint-config-next/core-web-vitals.js";
import nextTs from "eslint-config-next/typescript.js";

import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: process.cwd(),
  resolvePluginsRelativeTo: process.cwd(),
});

export default [
  // Ignore build outputs (mimics eslint-config-next defaults).
  {
    ignores: ["**/.next/**", "**/out/**", "**/build/**", "**/next-env.d.ts"],
  },
  ...compat.config(nextVitals),
  ...compat.config(nextTs),
];
