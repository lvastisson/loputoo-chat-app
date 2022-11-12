module.exports = {
  env: {
    Node: true,
    es2021: true,
  },
  extends: [
    "standard-with-typescript",
    "plugin:prettier/recommend",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {},
};
