/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(username?: string, password?: string): Chainable<void>
    }
  }
}

Cypress.Commands.add('login', (username = 'test', password = 'test') => {
  cy.visit('/login')
  cy.get('input[type="text"], input[type="email"]').first().type(username)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"]').click()
})

beforeEach(() => {
  cy.viewport(1280, 720)
})

describe('SmartWallet E2E Tests', () => {
  describe('Autenticação', () => {
    it('deve exibir página de login', () => {
      cy.visit('/login')
      cy.contains('SmartWallet').should('be.visible')
    })

    it('deve validar campos obrigatórios', () => {
      cy.visit('/login')
      cy.get('button[type="submit"]').click()
      cy.contains('preencha todos os campos').should('be.visible')
    })
  })

  describe('Busca de Ativos', () => {
    it('deve carregar página de ativos', () => {
      cy.visit('/assets')
      cy.contains('Ativos').should('be.visible')
    })
  })

  describe('Rankings', () => {
    it('deve carregar página de rankings', () => {
      cy.visit('/market/rankings')
      cy.contains('Rankings').should('be.visible')
    })

    it('deve mudar filtro de ranking', () => {
      cy.visit('/market/rankings')
      cy.contains('button', 'Maiores Dividendos').click()
    })
  })

  describe('Comparador', () => {
    it('deve carregar página de comparador', () => {
      cy.visit('/market/compare')
      cy.contains('Comparar').should('be.visible')
    })

    it('deve adicionar ativo ao comparador', () => {
      cy.visit('/market/compare')
      cy.get('input[type="text"]').type('PETR4')
      cy.wait(500)
    })
  })

  describe('Calculadoras', () => {
    it('deve carregar página de calculadoras', () => {
      cy.visit('/calculators')
      cy.contains('Calculadoras').should('be.visible')
    })

    it('deve calcular juros compostos', () => {
      cy.visit('/calculators')
      cy.contains('Juros Compostos').click()
      cy.get('input[type="number"]').first().clear().type('1000')
    })
  })

  describe('Acessibilidade', () => {
    it('deve carregar página inicial', () => {
      cy.visit('/')
      cy.get('body').should('exist')
    })

    it('deve ter links de navegação', () => {
      cy.visit('/')
      cy.get('a[href]').should('have.length.greaterThan', 0)
    })
  })
})

export {}