// client/src/components/LoginForm.jsx - Login form component

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

const LoginForm = ({ onLogin, isLoading = false, error = null }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onLogin(formData);
    }
  };

  const getFieldError = (fieldName) => {
    return validationErrors[fieldName] || '';
  };

  return (
    <div className="login-form">
      <h2>Login</h2>
      
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={getFieldError('email') ? 'error' : ''}
            disabled={isLoading}
            aria-describedby={getFieldError('email') ? 'email-error' : undefined}
          />
          {getFieldError('email') && (
            <span id="email-error" className="error-text" role="alert">
              {getFieldError('email')}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={getFieldError('password') ? 'error' : ''}
            disabled={isLoading}
            aria-describedby={getFieldError('password') ? 'password-error' : undefined}
          />
          {getFieldError('password') && (
            <span id="password-error" className="error-text" role="alert">
              {getFieldError('password')}
            </span>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="login-button"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </div>
  );
};

LoginForm.propTypes = {
  onLogin: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string
};

export default LoginForm; 