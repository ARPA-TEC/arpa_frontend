// ───────────────────────────────────────────────────────────────
// Integración Completa - ARPA
// Valida flujos completos que involucran múltiples componentes.
// ───────────────────────────────────────────────────────────────

Cypress.Commands.add('loginAsAdmin', () => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:3000/api/auth/login/admin',
    body: {
      email: 'sebastian.admin@arpa.com',
      password: '123456',
    },
  }).then(({ body }) => {
    window.localStorage.setItem('token', body.token);
    window.localStorage.setItem('user', JSON.stringify(body.user));
  });
});

describe('Integración Completa - ARPA', () => {

  beforeEach(() => {
    cy.loginAsAdmin();

    cy.intercept('GET', 'http://localhost:3000/api/students').as('getStudents');
    cy.intercept('GET', 'http://localhost:3000/api/tutors').as('getTutors');

    cy.visit('/dashboard/admin');

    cy.wait('@getStudents');
    cy.wait('@getTutors');
  });

  // ────────────────────────────────────────────────────────────
  // 1. Crear estudiante y encontrarlo mediante búsqueda
  // ────────────────────────────────────────────────────────────
  it('crea un estudiante y puede encontrarse usando el filtro', () => {

    const timestamp = Date.now();
    const nombre = `Integracion${timestamp}`;
    const apellido = 'Cypress';

    cy.intercept('POST', 'http://localhost:3000/api/students').as('createStudent');

    cy.get('.btn-add-primary').contains('Añadir estudiante').click();

    cy.get('.modal-box').within(() => {
      cy.get('input[placeholder="Nombre"]').type(nombre);
      cy.get('input[placeholder="Apellido"]').type(apellido);

      cy.get('select').first().select('A1');

      cy.get('select').last()
        .find('option')
        .not('[value=""]')
        .first()
        .then(($opt) => {
          cy.get('select').last().select($opt.val());
        });

      cy.get('.btn-add-primary').click();
    });

    cy.wait('@createStudent');

    cy.get('.admin-search').clear().type(nombre);

    cy.get('.card-student-name')
      .contains(`${nombre} ${apellido}`)
      .should('be.visible');
  });

  // ────────────────────────────────────────────────────────────
  // 2. Persistencia de estudiante después de recargar
  // ────────────────────────────────────────────────────────────
  it('mantiene un estudiante creado después de recargar la página', () => {

    const timestamp = Date.now();
    const nombre = `Persistencia${timestamp}`;
    const apellido = 'Reload';

    cy.intercept('POST', 'http://localhost:3000/api/students').as('createStudent');

    cy.get('.btn-add-primary').contains('Añadir estudiante').click();

    cy.get('.modal-box').within(() => {
      cy.get('input[placeholder="Nombre"]').type(nombre);
      cy.get('input[placeholder="Apellido"]').type(apellido);

      cy.get('select').first().select('B1');

      cy.get('select').last()
        .find('option')
        .not('[value=""]')
        .first()
        .then(($opt) => {
          cy.get('select').last().select($opt.val());
        });

      cy.get('.btn-add-primary').click();
    });

    cy.wait('@createStudent');

    cy.reload();

    cy.get('.admin-search').type(nombre);

    cy.get('.card-student-name')
      .contains(`${nombre} ${apellido}`)
      .should('exist');
  });

  // ────────────────────────────────────────────────────────────
  // 3. Registrar horas extras y conservarlas al navegar
  // ────────────────────────────────────────────────────────────
  it('conserva las horas extras después de cambiar de pestaña', () => {

    cy.get('.admin-nav-btn').contains('Tutores').click();

    cy.get('.hrs-badge')
      .first()
      .invoke('text')
      .then((text) => {

        const horasIniciales = parseFloat(text);

        cy.intercept(
          'POST',
          /\/api\/tutors\/\d+\/horas-extras/
        ).as('addHoras');

        cy.get('.expand-toggle').first().click();

        cy.get('.tutor-expand').within(() => {
          cy.get('input[type="date"]').type('2026-07-01');
          cy.get('input[type="number"]').type('1');
          cy.get('input[placeholder="Describe el motivo"]')
            .type('Integracion Cypress');

          cy.get('.btn-add-hours').click();
        });

        cy.wait('@addHoras');

        cy.contains('Estudiantes').click();
        cy.contains('Tutores').click();

        cy.get('.hrs-badge')
          .first()
          .should(($badge) => {
            expect(parseFloat($badge.text()))
              .to.eq(horasIniciales + 1);
          });
      });
  });

  // ────────────────────────────────────────────────────────────
  // 4. Verificar que el filtro puede encontrar estudiantes nuevos
  // ────────────────────────────────────────────────────────────
  it('permite buscar varios estudiantes consecutivamente', () => {

    cy.get('.admin-search').type('Twincho');

    cy.get('.card-student-name').each(($el) => {
      expect($el.text().toLowerCase()).to.include('twincho');
    });

    cy.get('.admin-search').clear();

    cy.get('.admin-search').type('Santiago');

    cy.get('.card-student-name').each(($el) => {
      expect($el.text().toLowerCase()).to.include('santiago');
    });
  });

  // ────────────────────────────────────────────────────────────
  // 5. Flujo completo de navegación entre módulos
  // ────────────────────────────────────────────────────────────
  it('permite navegar repetidamente entre estudiantes y tutores sin perder información', () => {

    cy.get('.card').should('have.length.at.least', 1);

    cy.get('.admin-nav-btn').contains('Tutores').click();

    cy.get('.expand-toggle').first().click();

    cy.get('.tutor-expand').should('be.visible');

    cy.get('.admin-nav-btn').contains('Estudiantes').click();

    cy.get('.card').should('have.length.at.least', 1);

    cy.get('.admin-nav-btn').contains('Tutores').click();

    cy.get('.expand-toggle').first().click();

    cy.get('.tutor-expand').should('be.visible');
  });

});