/// <reference types="cypress" />

beforeEach(() => {
  cy.viewport(1280, 720)
})

Cypress.Commands.add('login', (username = 'test', password = 'test') => {
  cy.visit('/login')
  cy.get('input[type="text"], input[type="email"]').first().type(username)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"], button[class*="btn"]').first().click()
})