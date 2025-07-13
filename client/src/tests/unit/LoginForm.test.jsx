// client/src/tests/unit/LoginForm.test.jsx - Unit tests for LoginForm component

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import LoginForm from '../../components/LoginForm';

describe('LoginForm Component', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    mockOnLogin.mockClear();
  });

  // Test rendering
  it('renders login form with all elements', () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  // Test form validation
  it('shows validation errors for empty fields', async () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('shows validation error for invalid email', async () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is invalid')).toBeInTheDocument();
    });

    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('shows validation error for short password', async () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });

    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  // Test successful form submission
  it('calls onLogin with form data when validation passes', async () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  // Test error display
  it('displays error message when provided', () => {
    const errorMessage = 'Invalid credentials';
    render(<LoginForm onLogin={mockOnLogin} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  // Test loading state
  it('shows loading state and disables form when isLoading is true', () => {
    render(<LoginForm onLogin={mockOnLogin} isLoading={true} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /logging in/i });

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Logging in...');
  });

  // Test input clearing validation errors
  it('clears validation errors when user starts typing', async () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    // Submit empty form to show errors
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    // Start typing to clear error
    fireEvent.change(emailInput, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });
  });

  // Test accessibility
  it('has proper accessibility attributes', () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(emailInput).toHaveAttribute('id', 'email');
    expect(passwordInput).toHaveAttribute('id', 'password');
  });

  // Test form submission with Enter key
  it('submits form when Enter key is pressed', async () => {
    const user = userEvent.setup();
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await act(async () => {
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
    });

    await act(async () => {
      await user.keyboard('{Enter}');
    });

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  // Test user event interactions
  it('handles user interactions correctly', async () => {
    const user = userEvent.setup();
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await act(async () => {
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
    });

    expect(mockOnLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
}); 