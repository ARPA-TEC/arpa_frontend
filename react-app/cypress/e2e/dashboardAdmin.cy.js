// ─── Comando reutilizable: login como administrador ───────────────────────────
// Centraliza la autenticación para que cada prueba no repita la lógica de login.
// Guarda token y user en localStorage igual que lo hace Login.jsx.
Cypress.Commands.add('loginAsAdmin', () => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:3000/api/auth/login/admin',
    body: { email: 'sebastian.admin@arpa.com', password: '123456' },
  }).then(({ body }) => {
    window.localStorage.setItem('token', body.token);
    window.localStorage.setItem('user', JSON.stringify(body.user));
  });
});

// ─── Suite principal ──────────────────────────────────────────────────────────
describe('Dashboard Administrador - ARPA', () => {

  // Interceptores base reutilizados en múltiples pruebas.
  // Se declaran dentro de beforeEach de cada contexto para mayor control.

  // ── Prueba 1: Registrar estudiante correctamente ───────────────────────────
  describe('1. Registrar estudiante correctamente', () => {
    beforeEach(() => {
      // Autenticación programática: más rápida y estable que llenar el form de login.
      cy.loginAsAdmin();

      // Interceptamos la carga inicial para no actuar sobre UI parcialmente cargada.
      cy.intercept('GET', 'http://localhost:3000/api/students').as('getStudents');
      cy.intercept('GET', 'http://localhost:3000/api/tutors').as('getTutors');

      cy.visit('/dashboard/admin');
      cy.wait('@getStudents');
      cy.wait('@getTutors');
    });

    it('crea el estudiante en el back, cierra el modal y lo muestra en la lista', () => {
      cy.get('.card').then((cardsBefore) => {
        const countBefore = cardsBefore.length;

        cy.intercept('POST', 'http://localhost:3000/api/students').as('createStudent');

        cy.get('.btn-add-primary').contains('Añadir estudiante').click();
        cy.get('.modal-box').should('be.visible');

        cy.get('.modal-box').within(() => {
          cy.get('input[placeholder="Nombre"]').type('Cypress');
          cy.get('input[placeholder="Apellido"]').type('Automatizado');
          cy.get('select').first().select('B1');
          cy.get('select').last().find('option').not('[value=""]').first().then(($opt) => {
            cy.get('select').last().select($opt.val());
          });
          cy.get('.btn-add-primary').click();
        });

        cy.wait('@createStudent').then(({ request, response }) => {
          // Validamos que el request tiene los datos correctos.
          expect(request.body.nombre).to.eq('Cypress');
          expect(request.body.apellido).to.eq('Automatizado');
          expect(request.body.id_nivel).to.be.a('number');
          expect(request.body.id_tutor).to.be.a('number');

          // Validamos que el back respondió 201 y generó un student_login_id
          // con el patrón incremental — demuestra que el sistema maneja
          // nombres repetidos correctamente sin colisiones.
          expect(response.statusCode).to.eq(201);
          expect(response.body.student.student_login_id).to.match(/^cypressautomatizado\d+$/);
        });

        // Modal cerrado correctamente.
        cy.get('.modal-box').should('not.exist');

        // La lista tiene exactamente una card más — sin importar cuántos
        // estudiantes con el mismo nombre ya existían.
        cy.get('.card').should('have.length', countBefore + 1);
      });
    });
  });

  // ── Prueba 2: Validar campos obligatorios al registrar estudiante ──────────
  describe('2. Validar campos obligatorios al registrar estudiante', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
      cy.intercept('GET', 'http://localhost:3000/api/students').as('getStudents');
      cy.intercept('GET', 'http://localhost:3000/api/tutors').as('getTutors');
      cy.visit('/dashboard/admin');
      cy.wait('@getStudents');
      cy.wait('@getTutors');
    });

    it('muestra mensaje de error y no llama al API cuando faltan campos', () => {
      // Interceptamos el POST para verificar que NO se dispara.
      cy.intercept('POST', 'http://localhost:3000/api/students').as('createStudent');

      cy.get('.btn-add-primary').contains('Añadir estudiante').click();
      cy.get('.modal-box').should('be.visible');

      // Llenamos solo el nombre — dejamos apellido, nivel y tutor vacíos.
      cy.get('.modal-box').within(() => {
        cy.get('input[placeholder="Nombre"]').type('SoloNombre');
        cy.get('.btn-add-primary').click();
      });

      // El mensaje de error debe ser visible — cambio de estado observable.
      cy.get('.modal-box').contains('Todos los campos son obligatorios.').should('be.visible');

      // El modal permanece abierto — no hubo flujo de éxito.
      cy.get('.modal-box').should('be.visible');

      // El API no fue llamado — validación crítica para demostrar que la
      // protección opera en el cliente antes de llegar al servidor.
      cy.get('@createStudent').should('be.null');
    });
  });

  // ── Prueba 3: Filtrar estudiantes por nombre ───────────────────────────────
  describe('3. Filtrar estudiantes por nombre', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
      cy.intercept('GET', 'http://localhost:3000/api/students').as('getStudents');
      cy.intercept('GET', 'http://localhost:3000/api/tutors').as('getTutors');
      cy.visit('/dashboard/admin');
      cy.wait('@getStudents');
      cy.wait('@getTutors');
    });

    it('reduce la lista a solo los estudiantes que coinciden con el término buscado', () => {
      // Registramos cuántos estudiantes hay en total antes de filtrar.
      cy.get('.card').then((allCards) => {
        const totalBefore = allCards.length;

        // Escribimos un nombre que existe en el seed.
        cy.get('.admin-search').type('Twincho');

        // Debe haber menos cards que antes — el filtro redujo la lista.
        cy.get('.card').should('have.length.lessThan', totalBefore);

        // La card visible debe contener el nombre buscado.
        cy.get('.card-student-name').each(($el) => {
          expect($el.text().toLowerCase()).to.include('twincho');
        });
      });
    });

    it('no muestra ninguna card para un nombre que no existe', () => {
      cy.get('.admin-search').type('EstudianteQueNoExisteJamas');
      cy.get('.card').should('have.length', 0);
    });

    it('restaura la lista completa al borrar el filtro', () => {
      cy.get('.card').then((allCards) => {
        const totalBefore = allCards.length;

        cy.get('.admin-search').type('Twincho');
        cy.get('.card').should('have.length.lessThan', totalBefore);

        // Al limpiar el input la lista vuelve a su estado original.
        cy.get('.admin-search').clear();
        cy.get('.card').should('have.length', totalBefore);
      });
    });
  });

  // ── Prueba 4: Registrar horas extras a tutor correctamente ────────────────
  describe('4. Registrar horas extras a tutor correctamente', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
      cy.intercept('GET', 'http://localhost:3000/api/students').as('getStudents');
      cy.intercept('GET', 'http://localhost:3000/api/tutors').as('getTutors');
      cy.visit('/dashboard/admin');
      cy.wait('@getStudents');
      cy.wait('@getTutors');

      // Navegamos a la pestaña de tutores.
      cy.get('.admin-nav-btn').contains('Tutores').click();
    });

    it('envía las horas al back, actualiza el badge y agrega el log en la tarjeta', () => {
      // Leemos las horas iniciales del primer tutor para comparar después.
      cy.get('.hrs-badge').first().invoke('text').then((hrsText) => {
        const hrsBefore = parseFloat(hrsText);

        // Interceptamos para validar request y response.
        cy.intercept('POST', /\/api\/tutors\/\d+\/horas-extras/).as('addHoras');

        // Abrimos la primera tarjeta de tutor.
        cy.get('.expand-toggle').first().click();
        cy.get('.tutor-expand').should('be.visible');

        // Llenamos el formulario de horas extras.
        cy.get('.tutor-expand').within(() => {
          cy.get('input[type="date"]').type('2026-06-15');
          cy.get('input[type="number"]').type('3');
          cy.get('input[placeholder="Describe el motivo"]').type('Taller especial Cypress');
          cy.get('.btn-add-hours').click();
        });

        // Validamos el intercept: request correcto y back respondió 201.
        cy.wait('@addHoras').then(({ request, response }) => {
          expect(request.body.horas).to.eq(3);
          expect(request.body.motivo).to.eq('Taller especial Cypress');
          expect(request.body.fecha).to.eq('2026-06-15');
          expect(response.statusCode).to.eq(201);
        });

        // Esperamos que el badge muestre exactamente hrsBefore + 3.
        // cy.should con callback reintenta automáticamente hasta el timeout
        // evitando la condición de carrera donde React aún no actualizó el DOM.
        cy.get('.hrs-badge').first().should(($badge) => {
          const hrsAfter = parseFloat($badge.text());
          expect(hrsAfter).to.eq(hrsBefore + 3);
        });

        // El badge de horas se actualizó sumando las 3 horas agregadas.
        cy.get('.hrs-badge').first().invoke('text').then((hrsAfterText) => {
          const hrsAfter = parseFloat(hrsAfterText);
          expect(hrsAfter).to.eq(hrsBefore + 3);
        });

        // El log aparece en la lista con el motivo correcto.
        cy.get('.log-ref').contains('Taller especial Cypress').should('be.visible');
      });
    });
  });

  // ── Prueba 5: Persistencia de horas extras tras recarga ───────────────────
  describe('5. Persistencia de horas extras tras recarga de página', () => {
    it('las horas extras persisten en la DB y se reflejan correctamente al recargar', () => {
      cy.loginAsAdmin();
      cy.intercept('GET', 'http://localhost:3000/api/students').as('getStudents');
      cy.intercept('GET', 'http://localhost:3000/api/tutors').as('getTutors');
      cy.visit('/dashboard/admin');
      cy.wait('@getStudents');
      cy.wait('@getTutors');

      cy.get('.admin-nav-btn').contains('Tutores').click();

      // Guardamos las horas iniciales en un alias de Cypress para mantener scope.
      cy.get('.hrs-badge').first().invoke('text').then((hrsBeforeText) => {
        const hrsBefore = parseFloat(hrsBeforeText);
        const hrsExpected = hrsBefore + 2;

        cy.intercept('POST', /\/api\/tutors\/\d+\/horas-extras/).as('addHoras');

        cy.get('.expand-toggle').first().click();

        cy.get('.tutor-expand').within(() => {
          cy.get('input[type="date"]').type('2026-06-20');
          cy.get('input[type="number"]').type('2');
          cy.get('input[placeholder="Describe el motivo"]').type('Persistencia Cypress');
          cy.get('.btn-add-hours').click();
        });

        cy.wait('@addHoras').then(({ response }) => {
          expect(response.statusCode).to.eq(201);
        });

        // Esperamos que el badge muestre el valor correcto antes de recargar.
        cy.get('.hrs-badge').first().should(($badge) => {
          expect(parseFloat($badge.text())).to.eq(hrsExpected);
        });

        // Recargamos — fuerza nuevo GET al back.
        cy.intercept('GET', 'http://localhost:3000/api/tutors').as('getTutorsReload');
        cy.reload();
        cy.wait('@getTutorsReload');

        cy.get('.admin-nav-btn').contains('Tutores').click();

        // Verificamos persistencia real en DB.
        cy.get('.hrs-badge').first().should(($badge) => {
          expect(parseFloat($badge.text())).to.eq(hrsExpected);
        });
      });
    });
  });
});
