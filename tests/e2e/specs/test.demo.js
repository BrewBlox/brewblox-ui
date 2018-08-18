// https://docs.cypress.io/api/introduction/api.html

describe('My First Test', () => {
  it('Visits the Kitchen Sink', () => {
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
  });
});
