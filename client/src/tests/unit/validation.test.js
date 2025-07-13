// client/src/tests/unit/validation.test.js - Unit tests for validation utilities

import {
  isValidEmail,
  validatePassword,
  validateUsername,
  validateRegistrationForm,
  validateLoginForm,
  validatePostForm,
  sanitizeInput,
  truncateText,
  formatDate,
  generateSlug
} from '../../utils/validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('returns true for valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('returns false for invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@example')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('returns valid for strong passwords', () => {
      const result = validatePassword('StrongPass123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns errors for weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 6 characters long');
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('returns error for empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });

    it('returns error for null password', () => {
      const result = validatePassword(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });
  });

  describe('validateUsername', () => {
    it('returns valid for good usernames', () => {
      const result = validateUsername('validuser123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns error for short usernames', () => {
      const result = validateUsername('ab');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username must be at least 3 characters long');
    });

    it('returns error for long usernames', () => {
      const longUsername = 'a'.repeat(31);
      const result = validateUsername(longUsername);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username cannot exceed 30 characters');
    });

    it('returns error for usernames with invalid characters', () => {
      const result = validateUsername('user-name');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username can only contain letters, numbers, and underscores');
    });

    it('returns error for empty username', () => {
      const result = validateUsername('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username is required');
    });
  });

  describe('validateRegistrationForm', () => {
    it('returns valid for complete valid data', () => {
      const formData = {
        username: 'validuser',
        email: 'test@example.com',
        password: 'StrongPass123'
      };

      const result = validateRegistrationForm(formData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('returns errors for invalid data', () => {
      const formData = {
        username: 'ab',
        email: 'invalid-email',
        password: 'weak'
      };

      const result = validateRegistrationForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.username).toBe('Username must be at least 3 characters long');
      expect(result.errors.email).toBe('Please provide a valid email');
      expect(result.errors.password).toBe('Password must be at least 6 characters long');
    });

    it('returns error for missing fields', () => {
      const formData = {
        username: '',
        email: '',
        password: ''
      };

      const result = validateRegistrationForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.username).toBe('Username is required');
      expect(result.errors.email).toBe('Email is required');
      expect(result.errors.password).toBe('Password is required');
    });
  });

  describe('validateLoginForm', () => {
    it('returns valid for complete valid data', () => {
      const formData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = validateLoginForm(formData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('returns errors for invalid data', () => {
      const formData = {
        email: 'invalid-email',
        password: ''
      };

      const result = validateLoginForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Please provide a valid email');
      expect(result.errors.password).toBe('Password is required');
    });
  });

  describe('validatePostForm', () => {
    it('returns valid for complete valid data', () => {
      const postData = {
        title: 'Valid Post Title',
        content: 'This is a valid post content with enough characters to pass validation.',
        category: '507f1f77bcf86cd799439011'
      };

      const result = validatePostForm(postData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('returns errors for invalid data', () => {
      const postData = {
        title: 'ab',
        content: 'short',
        category: ''
      };

      const result = validatePostForm(postData);
      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBe('Title must be at least 3 characters long');
      expect(result.errors.content).toBe('Content must be at least 10 characters long');
      expect(result.errors.category).toBe('Category is required');
    });

    it('returns error for long title', () => {
      const longTitle = 'a'.repeat(201);
      const postData = {
        title: longTitle,
        content: 'Valid content with enough characters.',
        category: '507f1f77bcf86cd799439011'
      };

      const result = validatePostForm(postData);
      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBe('Title cannot exceed 200 characters');
    });
  });

  describe('sanitizeInput', () => {
    it('sanitizes HTML special characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      expect(sanitizeInput('& < > " \' /')).toBe('&amp; &lt; &gt; &quot; &#x27; &#x2F;');
    });

    it('returns non-string inputs unchanged', () => {
      expect(sanitizeInput(123)).toBe(123);
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(undefined)).toBe(undefined);
      expect(sanitizeInput({ key: 'value' })).toEqual({ key: 'value' });
    });

    it('returns empty string unchanged', () => {
      expect(sanitizeInput('')).toBe('');
    });
  });

  describe('truncateText', () => {
    it('truncates text longer than max length', () => {
      const longText = 'This is a very long text that needs to be truncated';
      expect(truncateText(longText, 20)).toBe('This is a very lo...');
    });

    it('does not truncate text shorter than max length', () => {
      const shortText = 'Short text';
      expect(truncateText(shortText, 20)).toBe('Short text');
    });

    it('uses custom suffix', () => {
      const longText = 'This is a very long text';
      expect(truncateText(longText, 10, '***')).toBe('This is***');
    });

    it('handles null and undefined', () => {
      expect(truncateText(null, 10)).toBe(null);
      expect(truncateText(undefined, 10)).toBe(undefined);
    });
  });

  describe('formatDate', () => {
    it('formats valid date strings', () => {
      expect(formatDate('2023-01-15T10:00:00Z')).toBe('Jan 15, 2023');
      expect(formatDate('2023-12-25')).toBe('Dec 25, 2023');
    });

    it('formats Date objects', () => {
      const date = new Date('2023-06-10');
      expect(formatDate(date)).toBe('Jun 10, 2023');
    });

    it('returns empty string for invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('');
      expect(formatDate('')).toBe('');
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('generateSlug', () => {
    it('generates slugs from titles', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('React & JavaScript Tutorial')).toBe('react-javascript-tutorial');
      expect(generateSlug('Test Title 123')).toBe('test-title-123');
    });

    it('handles special characters', () => {
      expect(generateSlug('Title with @#$% symbols')).toBe('title-with-symbols');
      expect(generateSlug('Title with spaces and punctuation!')).toBe('title-with-spaces-and-punctuation');
    });

    it('removes leading and trailing hyphens', () => {
      expect(generateSlug(' Title with spaces ')).toBe('title-with-spaces');
      expect(generateSlug('-Title with leading hyphen-')).toBe('title-with-leading-hyphen');
    });

    it('returns empty string for empty input', () => {
      expect(generateSlug('')).toBe('');
      expect(generateSlug(null)).toBe('');
      expect(generateSlug(undefined)).toBe('');
    });
  });
}); 