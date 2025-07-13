// client/cypress/support/e2e.js - Cypress support file

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  if (err.message.includes('Script error')) {
    return false;
  }
  return true;
});

// Global beforeEach hook
beforeEach(() => {
  // Clear localStorage and sessionStorage
  cy.clearLocalStorage();
  cy.clearCookies();
  
  // Reset any previous state
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

// Custom command to login
Cypress.Commands.add('login', (email = 'test@example.com', password = 'Password123') => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:5000/api/auth/login',
    body: {
      email,
      password
    }
  }).then((response) => {
    if (response.body.token) {
      window.localStorage.setItem('token', response.body.token);
      window.localStorage.setItem('user', JSON.stringify(response.body.user));
    }
  });
});

// Custom command to register a new user
Cypress.Commands.add('registerUser', (userData) => {
  const defaultUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Password123',
    profile: {
      firstName: 'John',
      lastName: 'Doe'
    }
  };

  const user = { ...defaultUser, ...userData };

  cy.request({
    method: 'POST',
    url: 'http://localhost:5000/api/auth/register',
    body: user
  });
});

// Custom command to create a post
Cypress.Commands.add('createPost', (postData, token) => {
  const defaultPost = {
    title: 'Test Post',
    content: 'This is a test post content for end-to-end testing.',
    category: '507f1f77bcf86cd799439011', // Mock category ID
    status: 'published'
  };

  const post = { ...defaultPost, ...postData };

  cy.request({
    method: 'POST',
    url: 'http://localhost:5000/api/posts',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: post
  });
});

// Custom command to wait for API response
Cypress.Commands.add('waitForApi', (method, url, alias) => {
  cy.intercept(method, url).as(alias);
  cy.wait(`@${alias}`);
});

// Custom command to check if element is visible and clickable
Cypress.Commands.add('shouldBeVisibleAndClickable', (selector) => {
  cy.get(selector).should('be.visible').should('not.be.disabled');
});

// Custom command to fill form fields
Cypress.Commands.add('fillForm', (formData) => {
  Object.keys(formData).forEach(field => {
    cy.get(`[name="${field}"]`).clear().type(formData[field]);
  });
});

// Custom command to validate form errors
Cypress.Commands.add('validateFormErrors', (expectedErrors) => {
  Object.keys(expectedErrors).forEach(field => {
    cy.get(`[data-testid="${field}-error"]`).should('contain', expectedErrors[field]);
  });
});

// Custom command to check toast notifications
Cypress.Commands.add('checkToast', (message, type = 'success') => {
  cy.get('[data-testid="toast"]').should('contain', message);
  if (type) {
    cy.get('[data-testid="toast"]').should('have.class', `toast-${type}`);
  }
});

// Custom command to navigate to a page
Cypress.Commands.add('navigateTo', (path) => {
  cy.visit(path);
  cy.url().should('include', path);
});

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('token');
    win.localStorage.removeItem('user');
  });
  cy.visit('/');
});

// Custom command to check if user is logged in
Cypress.Commands.add('isLoggedIn', () => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('token');
    const user = win.localStorage.getItem('user');
    return token && user;
  });
});

// Custom command to wait for loading to complete
Cypress.Commands.add('waitForLoading', () => {
  cy.get('[data-testid="loading"]').should('not.exist');
  cy.get('[data-testid="loading-spinner"]').should('not.exist');
});

// Custom command to check responsive design
Cypress.Commands.add('checkResponsive', () => {
  const viewports = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1280, height: 720, name: 'desktop' }
  ];

  viewports.forEach(viewport => {
    cy.viewport(viewport.width, viewport.height);
    cy.get('body').should('be.visible');
  });
}); 