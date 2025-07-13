// client/src/components/Button.jsx - Reusable Button component

import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  onClick, 
  className = '', 
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
    warning: 'btn-warning',
    info: 'btn-info'
  };
  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg'
  };
  const disabledClass = disabled ? 'btn-disabled' : '';

  const buttonClasses = [
    baseClasses,
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || sizeClasses.md,
    disabledClass,
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success', 'warning', 'info']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset'])
};

export default Button; 