describe('Dashboard Tutor - ARPA', () => {

    beforeEach(() => {
        cy.visit('http://localhost:5173/dashboard/tutor')
    })

    it('Mostrar pestaña de bitácoras correctamente', () => {

        cy.get('[data-testid="tab-bitacoras"]')
            .click()

        cy.get('[data-testid="bitacora-card"]')
            .should('have.length.at.least', 1)

    })

    it('No mostrar resultados para estudiante inexistente', () => {

        cy.get('[data-testid="tab-bitacoras"]')
            .click()
    
        cy.get('[data-testid="search-input"]')
            .type('AlumnoInexistente')
    
        cy.get('[data-testid="bitacora-card"]')
            .should('have.length', 0)
    
    })

    it('Filtrar correctamente estudiante existente', () => {

        cy.get('[data-testid="tab-bitacoras"]')
            .click()
    
        cy.get('[data-testid="search-input"]')
            .type('Oriana')
    
        cy.contains('Oriana Cañizales')
            .should('exist')
    
    })

})