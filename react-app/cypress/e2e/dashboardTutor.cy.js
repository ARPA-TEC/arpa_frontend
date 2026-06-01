describe('Dashboard Tutor - ARPA', () => {
  beforeEach(() => {
    
    cy.visit('/');
    cy.get('#lf-email').type('oriana.tutor@arpa.com');
    cy.get('#lf-password').type('123456');
    cy.get('#lf-role').select('TUTOR');
    cy.get('.lf-btn').click();
    cy.url().should('include', '/dashboard/tutor');

  });

  it('Mostrar pestaña de bitácoras correctamente', () => {

    cy.get('[data-testid="tab-bitacoras"]').click();
    cy.get('[data-testid="bitacora-card"]').should('have.length.at.least', 1);

  });

  it('No mostrar resultados para estudiante inexistente', () => {

    cy.get('[data-testid="tab-bitacoras"]').click();
    cy.get('[data-testid="search-input"]').type('AlumnoInexistente');
    cy.get('[data-testid="bitacora-card"]').should('have.length', 0);

  });

  it('Filtrar correctamente estudiante existente', () => {

    cy.get('[data-testid="tab-bitacoras"]').click();
    cy.get('[data-testid="search-input"]').type('Twincho');
    cy.get('[data-testid="bitacora-card"]').should('have.length.at.least', 1);
    cy.contains('Twincho Salinas').should('exist');

  });

  it('Expandir una bitácora al hacer click muestra las notas completas', () => {

    cy.get('[data-testid="tab-bitacoras"]').click();
    cy.get('[data-testid="bitacora-card"]').first().click();
    cy.get('[data-testid="bitacora-card"]').first()
      .find('.bitacora-notas')
      .should('have.css', 'white-space', 'normal');

  });

  it('Mostrar pestaña de estudiantes con al menos una card', () => {

    cy.get('[data-testid="tab-estudiantes"]').click();
    cy.get('[data-testid="estudiante-card"]').should('have.length.at.least', 1);

  });

  it('Abrir modal de añadir bitácora al hacer click en el botón', () => {

    cy.get('[data-testid="tab-bitacoras"]').click();
    cy.contains('Añadir bitácora').click();
    cy.contains('Añadir bitácora').should('be.visible');
    cy.get('.modal-overlay').should('exist');

    cy.contains('Cancelar').click();
    cy.get('.modal-overlay').should('not.exist');

  });

});