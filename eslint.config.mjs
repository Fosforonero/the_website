import nextBase from "eslint-config-next";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextBase,
  ...nextCoreWebVitals,
  {
    ignores: [".next/**", "node_modules/**", "_design_reference/**"],
  },
];

export default config;
