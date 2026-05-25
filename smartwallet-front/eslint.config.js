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
      "@angular-eslint/no-output-on-prefix": "off",
      "@angular-eslint/prefer-inject": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["**/*.html"],
    languageOptions: {
      parser: require("@angular-eslint/template-parser"),
    },
    plugins: {
      "@angular-eslint/template": require("@angular-eslint/eslint-plugin-template"),
    },
    rules: {
      ...require("@angular-eslint/eslint-plugin-template").configs["recommended"].rules,
      "@angular-eslint/template/prefer-control-flow": "off",
    },
  },
];
