// client/cypress/support/commands.js - Cypress custom commands

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })

// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })

// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Custom command to type with delay (useful for slow typing simulation)
Cypress.Commands.add('typeSlow', { prevSubject: 'element' }, (subject, text, delay = 100) => {
  cy.wrap(subject).clear();
  text.split('').forEach((char, index) => {
    cy.wrap(subject).type(char, { delay });
  });
});

// Custom command to check if element exists
Cypress.Commands.add('elementExists', (selector) => {
  return cy.get('body').then(($body) => {
    return $body.find(selector).length > 0;
  });
});

// Custom command to wait for element to be visible
Cypress.Commands.add('waitForElement', (selector, timeout = 10000) => {
  cy.get(selector, { timeout }).should('be.visible');
});

// Custom command to scroll to element
Cypress.Commands.add('scrollToElement', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).scrollIntoView();
});

// Custom command to check if element is in viewport
Cypress.Commands.add('isInViewport', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).should('be.visible');
  cy.wrap(subject).should('not.be.disabled');
});

// Custom command to take screenshot with custom name
Cypress.Commands.add('takeScreenshot', (name) => {
  cy.screenshot(name);
});

// Custom command to check console for errors
Cypress.Commands.add('checkConsoleErrors', () => {
  cy.window().then((win) => {
    cy.spy(win.console, 'error').as('consoleError');
  });
});

// Custom command to verify no console errors
Cypress.Commands.add('verifyNoConsoleErrors', () => {
  cy.get('@consoleError').should('not.have.been.called');
});

// Custom command to check network requests
Cypress.Commands.add('checkNetworkRequests', (method, url) => {
  cy.intercept(method, url).as('networkRequest');
  cy.wait('@networkRequest');
});

// Custom command to mock API response
Cypress.Commands.add('mockApiResponse', (method, url, response) => {
  cy.intercept(method, url, response).as('mockedResponse');
});

// Custom command to check accessibility
Cypress.Commands.add('checkAccessibility', () => {
  cy.injectAxe();
  cy.checkA11y();
});

// Custom command to test keyboard navigation
Cypress.Commands.add('testKeyboardNavigation', () => {
  cy.get('body').tab();
  cy.focused().should('exist');
});

// Custom command to check if element has specific CSS class
Cypress.Commands.add('hasClass', { prevSubject: 'element' }, (subject, className) => {
  cy.wrap(subject).should('have.class', className);
});

// Custom command to check if element has specific attribute
Cypress.Commands.add('hasAttribute', { prevSubject: 'element' }, (subject, attribute, value) => {
  if (value) {
    cy.wrap(subject).should('have.attr', attribute, value);
  } else {
    cy.wrap(subject).should('have.attr', attribute);
  }
});

// Custom command to check if element contains text
Cypress.Commands.add('containsText', { prevSubject: 'element' }, (subject, text) => {
  cy.wrap(subject).should('contain', text);
});

// Custom command to check if element is disabled
Cypress.Commands.add('isDisabled', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).should('be.disabled');
});

// Custom command to check if element is enabled
Cypress.Commands.add('isEnabled', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).should('not.be.disabled');
});

// Custom command to check if element is hidden
Cypress.Commands.add('isHidden', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).should('not.be.visible');
});

// Custom command to check if element is visible
Cypress.Commands.add('isVisible', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).should('be.visible');
});

// Custom command to check if element is checked (for checkboxes/radio buttons)
Cypress.Commands.add('isChecked', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).should('be.checked');
});

// Custom command to check if element is not checked
Cypress.Commands.add('isNotChecked', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).should('not.be.checked');
});

// Custom command to wait for page load
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible');
  cy.window().then((win) => {
    expect(win.document.readyState).to.eq('complete');
  });
});

// Custom command to check if URL contains path
Cypress.Commands.add('urlContains', (path) => {
  cy.url().should('include', path);
});

// Custom command to check if URL equals path
Cypress.Commands.add('urlEquals', (path) => {
  cy.url().should('eq', path);
});

// Custom command to reload page
Cypress.Commands.add('reloadPage', () => {
  cy.reload();
  cy.waitForPageLoad();
});

// Custom command to go back
Cypress.Commands.add('goBack', () => {
  cy.go('back');
  cy.waitForPageLoad();
});

// Custom command to go forward
Cypress.Commands.add('goForward', () => {
  cy.go('forward');
  cy.waitForPageLoad();
}); 