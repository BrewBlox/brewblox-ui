// https://docs.cypress.io/api/introduction/api.html

describe('Wizard tests', () => {
  it('Restarts the backend', () => {
    cy.exec('npm run couchdb:docs');
    cy.exec('npm run spark:blocks');
  });

  it('Creates a new SetpointSensorPair', () => {
    cy.visit('/');
    cy.location('pathname', { timeout: 10000 }).should('eq', '/dashboard/dashboard-home');

    // Open Widget wizard
    cy.contains('menu').click();
    cy.contains('Wizardry').click();
    cy.contains('Widget').click();

    cy.contains(/NEXT$/i).should('be.disabled');

    cy.get('.q-select__input').click();
    cy.contains('Sensor/Setpoint Pair').click();
    cy.contains(/NEXT$/i).click();

    cy.contains(/CREATE NEW BLOCK$/i).click();
    cy.wait(10);

    cy.contains(/CONFIGURE BLOCK$/i).should('be.disabled');
    cy.contains(/CREATE$/i).should('be.disabled');

    cy.get('[type="text"]').type('new-ssp');

    cy.contains(/CONFIGURE BLOCK$/i).click();

    cy.contains('--.--').click();
    cy.get('[type="number"]').type('20');
    cy.contains(/OK$/i).click();
    cy.contains('20.00');

    cy.get('body').type('{esc}');
    cy.contains(/CREATE$/i).click();

    cy.contains('new-ssp');
  });

});
