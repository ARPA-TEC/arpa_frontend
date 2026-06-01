// Comando reutilizable: autenticación programática como administrador.
// Usa cy.request() directo al API en lugar de llenar el formulario de login,
// lo que hace las pruebas más rápidas y estables.
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