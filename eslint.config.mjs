import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import { globalIgnores } from "eslint/config";

const config = [
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([".next/**", "node_modules/**", "out/**", "next-env.d.ts"]),
];

export default config;
