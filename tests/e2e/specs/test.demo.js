// https://docs.cypress.io/api/introduction/api.html

describe('Wizard tests', () => {
  it('Creates a new SensorSetPointPair', () => {
    cy.visit('/');
    // click hamburger menu
    cy.get('.q-toolbar > .q-btn > .q-btn-inner > .q-icon').click();
    cy.contains('Blocks').click();
    cy.contains('spark/sensor-setpoint-pair-1');
    cy.contains('Home Dashboard').click();
    // click only button in toolbar (edit dashboard)
    cy.get('.toolbar-buttons > .q-btn').click();
    // add widget
    cy.get('.toolbar-buttons > .q-btn').first().click();
    cy.contains('Sensor SetPoint Pair').click();
    cy.get('.q-stepper-nav > .q-btn').click();
    cy.contains('Choose a block').click();
    cy.contains('Create').click();

    // Create new SensorSetPointPair
    cy.contains('spark').click();
    // Primary button should be "next"
    cy.get('.q-stepper-nav > .bg-primary').click();

    cy.get('.q-modal-layout-content').within(() => {
      // open drop down menu
      cy.get('.q-if').first().click();
    })
  });
});
