const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'smartwallet-front/cypress/**/*.cy.ts',
    supportFile: 'smartwallet-front/cypress/support/index.ts',
    allowCypressEnv: false,
  },
});