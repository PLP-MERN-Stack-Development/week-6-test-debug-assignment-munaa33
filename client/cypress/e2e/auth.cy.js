// client/cypress/e2e/auth.cy.js - End-to-end tests for authentication

describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('User Registration', () => {
    it('should register a new user successfully', () => {
      // Navigate to registration page
      cy.get('[data-testid="register-link"]').click();
      cy.urlContains('/register');

      // Fill registration form
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      };

      cy.fillForm(userData);

      // Submit form
      cy.get('[data-testid="register-button"]').click();

      // Check for success message
      cy.checkToast('Registration successful');
      
      // Should redirect to dashboard or home
      cy.urlContains('/dashboard');
      
      // Check if user is logged in
      cy.isLoggedIn().should('be.true');
    });

    it('should show validation errors for invalid registration data', () => {
      cy.get('[data-testid="register-link"]').click();
      
      // Try to submit empty form
      cy.get('[data-testid="register-button"]').click();
      
      // Check for validation errors
      cy.validateFormErrors({
        username: 'Username is required',
        email: 'Email is required',
        password: 'Password is required'
      });
    });

    it('should show error for duplicate email', () => {
      // First, register a user
      cy.registerUser({
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'Password123'
      });

      // Try to register with same email
      cy.get('[data-testid="register-link"]').click();
      
      const userData = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      };

      cy.fillForm(userData);
      cy.get('[data-testid="register-button"]').click();

      // Check for error message
      cy.checkToast('Email already exists', 'error');
    });

    it('should show error for weak password', () => {
      cy.get('[data-testid="register-link"]').click();
      
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'weak',
        confirmPassword: 'weak'
      };

      cy.fillForm(userData);
      cy.get('[data-testid="register-button"]').click();

      cy.validateFormErrors({
        password: 'Password must be at least 6 characters'
      });
    });
  });

  describe('User Login', () => {
    beforeEach(() => {
      // Create a test user
      cy.registerUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123'
      });
    });

    it('should login successfully with valid credentials', () => {
      cy.get('[data-testid="login-link"]').click();
      cy.urlContains('/login');

      const loginData = {
        email: 'test@example.com',
        password: 'Password123'
      };

      cy.fillForm(loginData);
      cy.get('[data-testid="login-button"]').click();

      cy.checkToast('Login successful');
      cy.urlContains('/dashboard');
      cy.isLoggedIn().should('be.true');
    });

    it('should show error for invalid credentials', () => {
      cy.get('[data-testid="login-link"]').click();
      
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123'
      };

      cy.fillForm(loginData);
      cy.get('[data-testid="login-button"]').click();

      cy.checkToast('Invalid credentials', 'error');
      cy.isLoggedIn().should('be.false');
    });

    it('should show error for non-existent email', () => {
      cy.get('[data-testid="login-link"]').click();
      
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123'
      };

      cy.fillForm(loginData);
      cy.get('[data-testid="login-button"]').click();

      cy.checkToast('Invalid credentials', 'error');
    });

    it('should show validation errors for empty fields', () => {
      cy.get('[data-testid="login-link"]').click();
      
      cy.get('[data-testid="login-button"]').click();
      
      cy.validateFormErrors({
        email: 'Email is required',
        password: 'Password is required'
      });
    });

    it('should show error for invalid email format', () => {
      cy.get('[data-testid="login-link"]').click();
      
      const loginData = {
        email: 'invalid-email',
        password: 'Password123'
      };

      cy.fillForm(loginData);
      cy.get('[data-testid="login-button"]').click();

      cy.validateFormErrors({
        email: 'Please provide a valid email'
      });
    });
  });

  describe('User Logout', () => {
    beforeEach(() => {
      // Login first
      cy.login();
      cy.visit('/dashboard');
    });

    it('should logout successfully', () => {
      cy.get('[data-testid="logout-button"]').click();
      
      // Should redirect to home page
      cy.urlContains('/');
      
      // Should not be logged in
      cy.isLoggedIn().should('be.false');
      
      // Should show logout message
      cy.checkToast('Logout successful');
    });

    it('should clear user data on logout', () => {
      cy.get('[data-testid="logout-button"]').click();
      
      // Check that localStorage is cleared
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null;
        expect(win.localStorage.getItem('user')).to.be.null;
      });
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing protected route without authentication', () => {
      // Try to access dashboard without being logged in
      cy.visit('/dashboard');
      
      // Should redirect to login
      cy.urlContains('/login');
      
      // Should show message about needing to login
      cy.checkToast('Please login to access this page', 'warning');
    });

    it('should allow access to protected routes when authenticated', () => {
      cy.login();
      cy.visit('/dashboard');
      
      // Should stay on dashboard
      cy.urlContains('/dashboard');
      
      // Should show user information
      cy.get('[data-testid="user-profile"]').should('be.visible');
    });
  });

  describe('Password Reset', () => {
    it('should show password reset form', () => {
      cy.get('[data-testid="login-link"]').click();
      cy.get('[data-testid="forgot-password-link"]').click();
      
      cy.urlContains('/forgot-password');
      cy.get('[data-testid="forgot-password-form"]').should('be.visible');
    });

    it('should send password reset email', () => {
      cy.get('[data-testid="login-link"]').click();
      cy.get('[data-testid="forgot-password-link"]').click();
      
      cy.get('[name="email"]').type('test@example.com');
      cy.get('[data-testid="send-reset-email-button"]').click();
      
      cy.checkToast('Password reset email sent');
    });
  });

  describe('Remember Me Functionality', () => {
    it('should remember user login when checkbox is checked', () => {
      cy.get('[data-testid="login-link"]').click();
      
      const loginData = {
        email: 'test@example.com',
        password: 'Password123'
      };

      cy.fillForm(loginData);
      cy.get('[data-testid="remember-me-checkbox"]').check();
      cy.get('[data-testid="login-button"]').click();
      
      // Close and reopen browser
      cy.reload();
      
      // Should still be logged in
      cy.isLoggedIn().should('be.true');
    });
  });

  describe('Form Accessibility', () => {
    it('should have proper form labels and ARIA attributes', () => {
      cy.get('[data-testid="login-link"]').click();
      
      // Check for proper labels
      cy.get('label[for="email"]').should('be.visible');
      cy.get('label[for="password"]').should('be.visible');
      
      // Check for ARIA attributes
      cy.get('[name="email"]').should('have.attr', 'aria-describedby');
      cy.get('[name="password"]').should('have.attr', 'aria-describedby');
    });

    it('should support keyboard navigation', () => {
      cy.get('[data-testid="login-link"]').click();
      
      // Test tab navigation
      cy.get('body').tab();
      cy.focused().should('have.attr', 'name', 'email');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'name', 'password');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'login-button');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      // Mock network error
      cy.intercept('POST', '/api/auth/login', { forceNetworkError: true }).as('loginError');
      
      cy.get('[data-testid="login-link"]').click();
      
      const loginData = {
        email: 'test@example.com',
        password: 'Password123'
      };

      cy.fillForm(loginData);
      cy.get('[data-testid="login-button"]').click();
      
      cy.wait('@loginError');
      cy.checkToast('Network error. Please try again.', 'error');
    });

    it('should show loading states during authentication', () => {
      cy.get('[data-testid="login-link"]').click();
      
      const loginData = {
        email: 'test@example.com',
        password: 'Password123'
      };

      cy.fillForm(loginData);
      cy.get('[data-testid="login-button"]').click();
      
      // Should show loading state
      cy.get('[data-testid="login-button"]').should('be.disabled');
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
    });
  });
}); 