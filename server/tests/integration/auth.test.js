// server/tests/integration/auth.test.js - Integration tests for auth endpoints

const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');

// Note: Database cleanup is handled globally in setup.js

describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const uniqueEmail = `test${Date.now()}@example.com`;
    const uniqueUsername = `testuser${Date.now()}`;
    
    const userData = {
      username: uniqueUsername,
      email: uniqueEmail,
      password: 'Password123',
      profile: {
        firstName: 'John',
        lastName: 'Doe'
      }
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.username).toBe(userData.username);
    expect(res.body.user.email).toBe(userData.email);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should return 400 for duplicate email', async () => {
    const uniqueEmail = `test${Date.now()}@example.com`;
    
    // Create first user
    await User.create({
      username: 'user1',
      email: uniqueEmail,
      password: 'Password123'
    });

    // Try to register with same email
    const userData = {
      username: 'user2',
      email: uniqueEmail,
      password: 'Password123'
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('already exists');
  });

  it('should return 400 for duplicate username', async () => {
    const uniqueUsername = `testuser${Date.now()}`;
    
    // Create first user
    await User.create({
      username: uniqueUsername,
      email: 'user1@example.com',
      password: 'Password123'
    });

    // Try to register with same username
    const userData = {
      username: uniqueUsername,
      email: 'user2@example.com',
      password: 'Password123'
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('already exists');
  });

  it('should return 400 for invalid email format', async () => {
    const uniqueUsername = `testuser${Date.now()}`;
    
    const userData = {
      username: uniqueUsername,
      email: 'invalid-email',
      password: 'Password123'
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation failed');
    expect(res.body.details).toHaveLength(1);
    expect(res.body.details[0].msg).toContain('valid email');
  });

  it('should return 400 for weak password', async () => {
    const uniqueEmail = `test${Date.now()}@example.com`;
    const uniqueUsername = `testuser${Date.now()}`;
    
    const userData = {
      username: uniqueUsername,
      email: uniqueEmail,
      password: 'weak'
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation failed');
    expect(res.body.details).toHaveLength(2); // Both length and complexity validation fail
    const errorMessages = res.body.details.map(d => d.msg);
    expect(errorMessages).toContain('Password must be at least 6 characters long');
    expect(errorMessages).toContain('Password must contain at least one uppercase letter, one lowercase letter, and one number');
  });

  it('should return 400 for short username', async () => {
    const uniqueEmail = `test${Date.now()}@example.com`;
    
    const userData = {
      username: 'ab',
      email: uniqueEmail,
      password: 'Password123'
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation failed');
    expect(res.body.details).toHaveLength(1);
    expect(res.body.details[0].msg).toContain('3 and 30 characters');
  });
});

describe('POST /api/auth/login', () => {
  let uniqueEmail;
  let uniqueUsername;

  beforeEach(async () => {
    // Create a test user with unique credentials
    uniqueEmail = `test${Date.now()}@example.com`;
    uniqueUsername = `testuser${Date.now()}`;
    
    await User.create({
      username: uniqueUsername,
      email: uniqueEmail,
      password: 'Password123'
    });
  });

  it('should login successfully with valid credentials', async () => {
    const loginData = {
      email: uniqueEmail,
      password: 'Password123'
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Login successful');
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(loginData.email);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should return 401 for invalid email', async () => {
    const loginData = {
      email: 'wrong@example.com',
      password: 'Password123'
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Invalid credentials');
  });

  it('should return 401 for invalid password', async () => {
    const loginData = {
      email: uniqueEmail,
      password: 'WrongPassword123'
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Invalid credentials');
  });

  it('should return 401 for deactivated account', async () => {
    // Deactivate the user
    await User.findOneAndUpdate(
      { email: uniqueEmail },
      { isActive: false }
    );

    const loginData = {
      email: uniqueEmail,
      password: 'Password123'
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Account is deactivated');
  });

  it('should return 400 for invalid email format', async () => {
    const loginData = {
      email: 'invalid-email',
      password: 'Password123'
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation failed');
  });

  it('should return 400 for missing password', async () => {
    const loginData = {
      email: uniqueEmail
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation failed');
  });
});

describe('GET /api/auth/me', () => {
  let token;
  let user;

  beforeEach(async () => {
    // Create a test user with unique email
    const uniqueEmail = `test${Date.now()}@example.com`;
    user = await User.create({
      username: `testuser${Date.now()}`,
      email: uniqueEmail,
      password: 'Password123'
    });

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueEmail,
        password: 'Password123'
      });

    token = loginRes.body.token;
  });

  it('should return user profile when authenticated', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user._id).toBe(user._id.toString());
    expect(res.body.user.username).toBe(user.username);
    expect(res.body.user.email).toBe(user.email);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should return 401 when no token provided', async () => {
    const res = await request(app)
      .get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 401 when invalid token provided', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

describe('PUT /api/auth/profile', () => {
  let token;
  let user;

  beforeEach(async () => {
    // Create a test user with unique email
    const uniqueEmail = `test${Date.now()}@example.com`;
    user = await User.create({
      username: `testuser${Date.now()}`,
      email: uniqueEmail,
      password: 'Password123',
      profile: {
        firstName: 'John',
        lastName: 'Doe'
      }
    });

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueEmail,
        password: 'Password123'
      });

    token = loginRes.body.token;
  });

  it('should update user profile successfully', async () => {
    const updateData = {
      profile: {
        firstName: 'Jane',
        lastName: 'Smith',
        bio: 'Updated bio information'
      }
    };

    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Profile updated successfully');
    expect(res.body.user.profile.firstName).toBe('Jane');
    expect(res.body.user.profile.lastName).toBe('Smith');
    expect(res.body.user.profile.bio).toBe('Updated bio information');
  });

  it('should return 400 for invalid profile data', async () => {
    const updateData = {
      profile: {
        firstName: 'a'.repeat(51), // Too long
        bio: 'a'.repeat(501) // Too long
      }
    };

    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation failed');
  });

  it('should return 401 when not authenticated', async () => {
    const updateData = {
      profile: {
        firstName: 'Jane'
      }
    };

    const res = await request(app)
      .put('/api/auth/profile')
      .send(updateData);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /api/auth/logout', () => {
  let token;

  beforeEach(async () => {
    // Create a test user with unique email and login
    const uniqueEmail = `test${Date.now()}@example.com`;
    await User.create({
      username: `testuser${Date.now()}`,
      email: uniqueEmail,
      password: 'Password123'
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueEmail,
        password: 'Password123'
      });

    token = loginRes.body.token;
  });

  it('should logout successfully', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Logout successful');
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(app)
      .post('/api/auth/logout');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
}); 