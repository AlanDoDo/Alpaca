import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
const eslintConfig = [
  { ignores: [".next/**", ".vercel/**", "node_modules/**", ".npm-cache/**", "next-env.d.ts"] },
  ...nextVitals,
  ...nextTs,
];

export default eslintConfig;
