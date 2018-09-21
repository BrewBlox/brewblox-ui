// https://docs.cypress.io/api/introduction/api.html

describe('Wizard tests', () => {
  // it('Restarts the backend', () => {
  //   cy.exec('npm run compose:new');
  // });

  it('Creates a new SetpointSensorPair', () => {
    cy.visit('/');
    cy.contains('menu').click();

    cy.contains('Blocks').click();
    cy.contains('spark/sensor-setpoint-pair-1');
    cy.contains('Home Dashboard').click();

    cy.contains(/EDIT DASHBOARD$/i).click();
    cy.contains(/ADD WIDGET$/i).click();

    cy.contains(/NEXT$/i).should('be.disabled');
    cy.contains('Sensor SetPoint Pair').click();
    cy.contains(/NEXT$/i).click();

    cy.contains('Choose a block').click();
    cy.contains('Create new').click();

    cy.contains(/NEXT$/i).should('be.disabled');
    cy.contains(/^spark$/).click();
    cy.contains(/NEXT$/i).click();


    cy.contains(/NEXT$/i).should('be.disabled');

    cy.get('.q-select').first().click();
    cy.contains('spark/sensor-1').click();

    cy.contains(/NEXT$/i).should('be.disabled');
    cy.get('.q-select').last().click();
    cy.contains('spark/setpoint-1').click();

    cy.contains(/NEXT$/i).click();

    cy.contains(/CREATE$/i).click();
    cy.contains(/NEXT$/i).click();

    cy.contains('spark/SetpointSensorPair-');
    cy.contains(/ADD TO DASHBOARD/i).click();

    cy.contains('spark/SetpointSensorPair');
  });
});
