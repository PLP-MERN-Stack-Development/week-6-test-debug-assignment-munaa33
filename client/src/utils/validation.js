// client/src/utils/validation.js - Validation utilities

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with isValid and errors
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates username format
 * @param {string} username - Username to validate
 * @returns {object} - Validation result with isValid and errors
 */
export const validateUsername = (username) => {
  const errors = [];
  
  if (!username) {
    errors.push('Username is required');
  } else {
    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    if (username.length > 30) {
      errors.push('Username cannot exceed 30 characters');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates form data for registration
 * @param {object} formData - Form data object
 * @returns {object} - Validation result with isValid and errors
 */
export const validateRegistrationForm = (formData) => {
  const errors = {};
  
  // Validate username
  const usernameValidation = validateUsername(formData.username);
  if (!usernameValidation.isValid) {
    errors.username = usernameValidation.errors[0];
  }
  
  // Validate email
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Please provide a valid email';
  }
  
  // Validate password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors[0];
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates form data for login
 * @param {object} formData - Form data object
 * @returns {object} - Validation result with isValid and errors
 */
export const validateLoginForm = (formData) => {
  const errors = {};
  
  // Validate email
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Please provide a valid email';
  }
  
  // Validate password
  if (!formData.password) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates post data
 * @param {object} postData - Post data object
 * @returns {object} - Validation result with isValid and errors
 */
export const validatePostForm = (postData) => {
  const errors = {};
  
  // Validate title
  if (!postData.title) {
    errors.title = 'Title is required';
  } else if (postData.title.length < 3) {
    errors.title = 'Title must be at least 3 characters long';
  } else if (postData.title.length > 200) {
    errors.title = 'Title cannot exceed 200 characters';
  }
  
  // Validate content
  if (!postData.content) {
    errors.content = 'Content is required';
  } else if (postData.content.length < 10) {
    errors.content = 'Content must be at least 10 characters long';
  }
  
  // Validate category
  if (!postData.category) {
    errors.category = 'Category is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Sanitizes input to prevent XSS
 * @param {string} input - Input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Truncates text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Formats date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Generates a slug from title
 * @param {string} title - Title to convert to slug
 * @returns {string} - Generated slug
 */
export const generateSlug = (title) => {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}; 