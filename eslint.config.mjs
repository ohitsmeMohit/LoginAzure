import globals from "globals";

// Minimal flat config to avoid runtime issues importing preset packages.
// This keeps globals and per-file sourceType settings while remaining self-contained.
export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
    rules: {},
  },
  {
    files: ["**/*.js"],
    languageOptions: { sourceType: "commonjs" },
  },
];
