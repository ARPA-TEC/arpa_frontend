describe('Login Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Debería hacer login exitosamente con credenciales de admin', () => {
    cy.get('#lf-email').type('sebastian.admin@arpa.com');
    cy.get('#lf-password').type('123456');
    cy.get('#lf-role').select('ADMINISTRADOR');
    cy.get('.lf-btn').click();

    cy.url().should('include', '/dashboard/admin');

  });

  it('Debería hacer login exitosamente con credenciales de tutor', () => {

    cy.get('#lf-email').type('oriana.tutor@arpa.com');
    cy.get('#lf-password').type('123456');
    cy.get('#lf-role').select('TUTOR');
    cy.get('.lf-btn').click();

    cy.url().should('include', '/dashboard/tutor');
  });

  it('Debería mostrar error con credenciales inválidas', () => {

    cy.get('#lf-email').type('invalid.user@example.com');
    cy.get('#lf-password').type('wrongpassword');
    cy.get('#lf-role').select('ADMINISTRADOR');
    cy.get('.lf-btn').click();

    cy.contains('Credenciales invalidas').should('be.visible');

    cy.url().should('eq', Cypress.config('baseUrl') + '/');
  });

  it('Debería hacer login exitosamente como estudiante', () => {
    cy.visit('/login/estudiante');
    cy.get('#campo_nombre').type('Santiago');
    cy.get('#campo_apellido').type('Salinas');
    cy.get('.lf-btn').click();
    
    cy.url().should('include', '/dashboard/estudiante');
  });


});