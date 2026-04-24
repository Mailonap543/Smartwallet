/* eslint-env node */

module.exports = [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        project: ["tsconfig.app.json", "tsconfig.spec.json"],
        createDefaultProgram: true,
      },
    },
    plugins: {
      "@angular-eslint": require("@angular-eslint/eslint-plugin"),
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    },
    rules: {
      ...require("@angular-eslint/eslint-plugin").configs["recommended"].rules,
      ...require("@typescript-eslint/eslint-plugin").configs["recommended"].rules,
    },
  },
  {
    files: ["**/*.html"],
    languageOptions: {
      parser: require("@angular-eslint/template-parser"),
    },
    plugins: {
      "@angular-eslint": require("@angular-eslint/eslint-plugin-template"),
    },
    rules: {
      ...require("@angular-eslint/eslint-plugin-template").configs["recommended"].rules,
    },
  },
];
