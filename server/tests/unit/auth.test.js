// server/tests/unit/auth.test.js - Unit tests for authentication utilities

const jwt = require('jsonwebtoken');
const { 
  generateToken, 
  verifyToken, 
  extractToken, 
  createRateLimiter 
} = require('../../src/utils/auth');
const User = require('../../src/models/User');

// Mock User model
jest.mock('../../src/models/User');

describe('Authentication Utilities', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    email: 'test@example.com',
    role: 'user'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('generates a valid JWT token', () => {
      const token = generateToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verify the token can be decoded
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-for-testing');
      expect(decoded.id).toBe(mockUser._id);
      expect(decoded.username).toBe(mockUser.username);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
    });

    it('includes issuer and audience in token', () => {
      const token = generateToken(mockUser);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-for-testing');
      
      expect(decoded.iss).toBe('mern-testing-app');
      expect(decoded.aud).toBe('mern-testing-users');
    });

    it('sets expiration time', () => {
      const token = generateToken(mockUser);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-for-testing');
      
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('verifies a valid token', () => {
      const token = generateToken(mockUser);
      const decoded = verifyToken(token);
      
      expect(decoded.id).toBe(mockUser._id);
      expect(decoded.username).toBe(mockUser.username);
    });

    it('throws error for invalid token', () => {
      expect(() => {
        verifyToken('invalid-token');
      }).toThrow();
    });

    it('throws error for expired token', () => {
      // Create a token that expires immediately
      const expiredToken = jwt.sign(
        { id: mockUser._id, username: mockUser.username },
        process.env.JWT_SECRET || 'your-secret-key-for-testing',
        { expiresIn: '0s' }
      );

      // Wait a bit for token to expire
      setTimeout(() => {
        expect(() => {
          verifyToken(expiredToken);
        }).toThrow();
      }, 100);
    });
  });

  describe('extractToken', () => {
    it('extracts token from Bearer header', () => {
      const token = 'valid-token-123';
      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };

      const extracted = extractToken(req);
      expect(extracted).toBe(token);
    });

    it('returns null for missing authorization header', () => {
      const req = {
        headers: {}
      };

      const extracted = extractToken(req);
      expect(extracted).toBeNull();
    });

    it('returns null for malformed authorization header', () => {
      const req = {
        headers: {
          authorization: 'InvalidFormat token123'
        }
      };

      const extracted = extractToken(req);
      expect(extracted).toBeNull();
    });

    it('returns null for authorization header without Bearer', () => {
      const req = {
        headers: {
          authorization: 'token123'
        }
      };

      const extracted = extractToken(req);
      expect(extracted).toBeNull();
    });
  });

  describe('createRateLimiter', () => {
    let rateLimiter;
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
      rateLimiter = createRateLimiter(1000, 2); // 1 second window, 2 requests max
      mockReq = {
        ip: '127.0.0.1'
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      mockNext = jest.fn();
    });

    it('allows requests within limit', () => {
      // First request
      rateLimiter(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalled();

      // Second request
      rateLimiter(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(2);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('blocks requests over limit', () => {
      // First two requests (within limit)
      rateLimiter(mockReq, mockRes, mockNext);
      rateLimiter(mockReq, mockRes, mockNext);

      // Third request (over limit)
      rateLimiter(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Too many requests. Please try again later.'
      });
      expect(mockNext).toHaveBeenCalledTimes(2);
    });

    it('resets limit after window expires', (done) => {
      // First two requests
      rateLimiter(mockReq, mockRes, mockNext);
      rateLimiter(mockReq, mockRes, mockNext);

      // Wait for window to expire
      setTimeout(() => {
        // Should allow requests again
        rateLimiter(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledTimes(3);
        expect(mockRes.status).not.toHaveBeenCalled();
        done();
      }, 1100); // Wait slightly longer than 1 second window
    });

    it('handles different IP addresses separately', () => {
      const req1 = { ip: '127.0.0.1' };
      const req2 = { ip: '192.168.1.1' };

      // Both IPs should be able to make requests
      rateLimiter(req1, mockRes, mockNext);
      rateLimiter(req2, mockRes, mockNext);
      rateLimiter(req1, mockRes, mockNext);
      rateLimiter(req2, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(4);
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('Token payload validation', () => {
    it('includes all required user fields in token', () => {
      const token = generateToken(mockUser);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-for-testing');
      
      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('username');
      expect(decoded).toHaveProperty('email');
      expect(decoded).toHaveProperty('role');
      expect(decoded).toHaveProperty('iat'); // issued at
      expect(decoded).toHaveProperty('exp'); // expiration
      expect(decoded).toHaveProperty('iss'); // issuer
      expect(decoded).toHaveProperty('aud'); // audience
    });

    it('handles different user roles', () => {
      const adminUser = { ...mockUser, role: 'admin' };
      const token = generateToken(adminUser);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-for-testing');
      
      expect(decoded.role).toBe('admin');
    });
  });

  describe('Error handling', () => {
    it('handles malformed tokens gracefully', () => {
      expect(() => {
        verifyToken('not.a.valid.token');
      }).toThrow();
    });

    it('handles tokens with wrong signature', () => {
      const wrongSignatureToken = jwt.sign(
        { id: mockUser._id },
        'wrong-secret'
      );

      expect(() => {
        verifyToken(wrongSignatureToken);
      }).toThrow();
    });
  });
}); 