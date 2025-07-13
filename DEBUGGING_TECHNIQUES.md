# Debugging Techniques Documentation

## Overview

This document outlines the debugging techniques and tools used throughout the development and testing of the MERN application. These techniques helped identify and resolve various issues encountered during the project.

## 1. JWT Token Debugging

### Problem Encountered

Authentication tests were failing with JWT token validation errors.

### Debugging Process

1. **Console Logging**: Added strategic console.log statements to track token generation and validation
2. **Token Inspection**: Used jwt.io to decode and inspect JWT tokens
3. **Secret Verification**: Compared JWT secrets between auth utility and test files

### Solution Implemented

```javascript
// Before: Inconsistent JWT secrets
const token = jwt.sign(payload, "different-secret");

// After: Consistent JWT secrets
const token = jwt.sign(payload, process.env.JWT_SECRET || "test-secret");
```

### Debugging Code Example

```javascript
// Debug JWT token generation
const generateToken = (user) => {
  console.log("Generating token for user:", user.email);
  const payload = { userId: user._id, email: user.email };
  console.log("Token payload:", payload);

  const token = jwt.sign(payload, process.env.JWT_SECRET || "test-secret");
  console.log("Generated token:", token);

  return token;
};
```

## 2. Database Testing Debugging

### Problem Encountered

Integration tests were failing due to database conflicts and improper cleanup.

### Debugging Process

1. **Database State Inspection**: Added logging to verify database state before and after tests
2. **Connection Monitoring**: Tracked MongoDB connections to identify leaks
3. **Test Isolation Verification**: Ensured each test runs with clean data

### Solution Implemented

```javascript
// Before: Tests sharing data
const testUser = { email: "test@example.com", username: "testuser" };

// After: Unique test data
const testUser = {
  email: `test${Date.now()}@example.com`,
  username: `testuser${Date.now()}`,
};
```

### Debugging Code Example

```javascript
describe("User Registration", () => {
  beforeEach(async () => {
    console.log("Setting up test database...");
    await mongoose.connect(process.env.MONGODB_URI_TEST);
    console.log("Database connected for test");
  });

  afterEach(async () => {
    console.log("Cleaning up test data...");
    await User.deleteMany({});
    console.log("Test data cleaned up");
  });

  it("should register a new user", async () => {
    const uniqueEmail = `test${Date.now()}@example.com`;
    console.log("Testing with email:", uniqueEmail);

    const response = await request(app)
      .post("/api/auth/register")
      .send({ email: uniqueEmail, password: "password123" });

    console.log("Registration response:", response.body);
    expect(response.status).toBe(201);
  });
});
```

## 3. ObjectId Debugging

### Problem Encountered

Posts integration tests were failing with "Invalid ObjectId" errors.

### Debugging Process

1. **ObjectId Format Inspection**: Verified ObjectId creation syntax
2. **MongoDB Query Logging**: Added logging to see actual database queries
3. **Error Message Analysis**: Examined specific error messages for clues

### Solution Implemented

```javascript
// Before: Incorrect ObjectId creation
const postId = mongoose.Types.ObjectId();

// After: Correct ObjectId creation
const postId = new mongoose.Types.ObjectId();
```

### Debugging Code Example

```javascript
// Debug ObjectId creation
const createTestPost = async () => {
  const postId = new mongoose.Types.ObjectId();
  console.log("Created ObjectId:", postId);
  console.log("ObjectId type:", typeof postId);
  console.log("ObjectId string:", postId.toString());

  return postId;
};
```

## 4. Jest Configuration Debugging

### Problem Encountered

Client-side tests were failing due to ES6 import and JSX syntax issues.

### Debugging Process

1. **Jest Configuration Analysis**: Reviewed Jest configuration for proper setup
2. **Babel Configuration Check**: Verified Babel presets for React and ES6 support
3. **Test Environment Verification**: Ensured proper test environment setup

### Solution Implemented

```javascript
// babel.config.js
module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    ["@babel/preset-react", { runtime: "automatic" }],
  ],
};
```

### Debugging Code Example

```javascript
// jest.config.js with debugging options
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  verbose: true, // Enable verbose output for debugging
  detectOpenHandles: true, // Detect async operations that weren't cleaned up
  moduleNameMapping: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  collectCoverageFrom: [
    "server/**/*.js",
    "client/src/**/*.{js,jsx}",
    "!**/node_modules/**",
    "!**/coverage/**",
  ],
};
```

## 5. API Response Debugging

### Problem Encountered

API endpoints were returning unexpected status codes and error messages.

### Debugging Process

1. **Request/Response Logging**: Added comprehensive logging for API calls
2. **Status Code Analysis**: Tracked HTTP status codes and their causes
3. **Error Message Inspection**: Examined error messages for debugging clues

### Debugging Code Example

```javascript
// Debug API responses
const debugApiCall = async (method, url, data = null) => {
  console.log(`\n=== API Call Debug ===`);
  console.log(`Method: ${method}`);
  console.log(`URL: ${url}`);
  if (data) console.log(`Data:`, data);

  const response = await request(app)
    [method.toLowerCase()](url)
    .send(data || {});

  console.log(`Status: ${response.status}`);
  console.log(`Response:`, response.body);
  console.log(`=== End Debug ===\n`);

  return response;
};

// Usage in tests
it("should create a post", async () => {
  const response = await debugApiCall("POST", "/api/posts", {
    title: "Test Post",
    content: "Test content",
  });

  expect(response.status).toBe(201);
});
```

## 6. Test Isolation Debugging

### Problem Encountered

Tests were interfering with each other due to shared state and improper cleanup.

### Debugging Process

1. **Test Order Analysis**: Identified tests that were affecting others
2. **State Inspection**: Added logging to track state changes between tests
3. **Cleanup Verification**: Ensured proper cleanup after each test

### Solution Implemented

```javascript
// Enhanced test setup with debugging
describe("Integration Tests", () => {
  beforeAll(async () => {
    console.log("Setting up test suite...");
    await mongoose.connect(process.env.MONGODB_URI_TEST);
  });

  beforeEach(async () => {
    console.log("Setting up individual test...");
    // Clear all collections
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
    console.log("Test setup complete");
  });

  afterEach(async () => {
    console.log("Cleaning up after test...");
    // Additional cleanup if needed
  });

  afterAll(async () => {
    console.log("Cleaning up test suite...");
    await mongoose.connection.close();
  });
});
```

## 7. Environment Variable Debugging

### Problem Encountered

Tests were failing due to missing or incorrect environment variables.

### Debugging Process

1. **Environment Inspection**: Added logging to verify environment variables
2. **Configuration Validation**: Checked if required variables were set
3. **Fallback Values**: Implemented proper fallback values for testing

### Debugging Code Example

```javascript
// Debug environment variables
const debugEnvironment = () => {
  console.log("=== Environment Variables ===");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "NOT SET");
  console.log(
    "MONGODB_URI_TEST:",
    process.env.MONGODB_URI_TEST ? "SET" : "NOT SET"
  );
  console.log("=== End Environment ===");
};

// Use in test setup
beforeAll(() => {
  debugEnvironment();
});
```

## 8. Async/Await Debugging

### Problem Encountered

Tests were not properly waiting for asynchronous operations to complete.

### Debugging Process

1. **Promise Chain Analysis**: Traced promise chains to identify missing awaits
2. **Timeout Issues**: Identified tests that were timing out
3. **Error Handling**: Added proper error handling for async operations

### Debugging Code Example

```javascript
// Debug async operations
const debugAsyncOperation = async (operation, description) => {
  console.log(`Starting: ${description}`);
  try {
    const result = await operation;
    console.log(`Completed: ${description}`, result);
    return result;
  } catch (error) {
    console.error(`Failed: ${description}`, error);
    throw error;
  }
};

// Usage in tests
it("should handle async operations", async () => {
  const result = await debugAsyncOperation(
    User.create({ email: "test@example.com", password: "password123" }),
    "User creation"
  );

  expect(result).toBeDefined();
});
```

## 9. Network Request Debugging

### Problem Encountered

API requests were failing with network errors or unexpected responses.

### Debugging Process

1. **Request Logging**: Added detailed logging for all HTTP requests
2. **Response Analysis**: Examined response headers and body
3. **Error Classification**: Categorized different types of network errors

### Debugging Code Example

```javascript
// Debug network requests with Supertest
const debugRequest = (request) => {
  return request
    .set("Accept", "application/json")
    .set("Content-Type", "application/json")
    .on("response", (response) => {
      console.log(`Response Status: ${response.status}`);
      console.log(`Response Headers:`, response.headers);
      console.log(`Response Body:`, response.body);
    })
    .on("error", (error) => {
      console.error("Request Error:", error);
    });
};

// Usage
const response = await debugRequest(
  request(app).post("/api/auth/login").send(credentials)
);
```

## 10. Memory Leak Debugging

### Problem Encountered

Tests were experiencing memory leaks due to unclosed database connections.

### Debugging Process

1. **Connection Monitoring**: Tracked database connections
2. **Resource Cleanup**: Ensured proper cleanup of resources
3. **Memory Usage Analysis**: Monitored memory usage during test execution

### Solution Implemented

```javascript
// Enhanced cleanup with debugging
const cleanupTestResources = async () => {
  console.log("Cleaning up test resources...");

  // Close database connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }

  // Clear any remaining timers
  jest.clearAllTimers();
  console.log("Timers cleared");

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
    console.log("Garbage collection forced");
  }
};
```

## Debugging Tools and Utilities

### 1. Custom Debug Logger

```javascript
const debugLogger = (namespace) => {
  return {
    log: (message, data) => {
      console.log(`[${namespace}] ${message}`, data || "");
    },
    error: (message, error) => {
      console.error(`[${namespace}] ERROR: ${message}`, error);
    },
    warn: (message, data) => {
      console.warn(`[${namespace}] WARNING: ${message}`, data || "");
    },
  };
};

// Usage
const logger = debugLogger("Auth Tests");
logger.log("Testing user registration");
```

### 2. Test Data Generator

```javascript
const generateTestData = (type, options = {}) => {
  const timestamp = Date.now();

  switch (type) {
    case "user":
      return {
        email: `test${timestamp}@example.com`,
        username: `testuser${timestamp}`,
        password: "password123",
        ...options,
      };
    case "post":
      return {
        title: `Test Post ${timestamp}`,
        content: `Test content ${timestamp}`,
        ...options,
      };
    default:
      throw new Error(`Unknown test data type: ${type}`);
  }
};
```

## Best Practices for Debugging

### 1. Systematic Approach

- Start with the most likely cause
- Use binary search to narrow down issues
- Document findings and solutions

### 2. Logging Strategy

- Use consistent logging format
- Include relevant context in log messages
- Remove debug logs before production

### 3. Error Handling

- Always handle errors gracefully
- Provide meaningful error messages
- Log errors with sufficient context

### 4. Test Isolation

- Ensure tests don't depend on each other
- Clean up after each test
- Use unique test data

## Conclusion

These debugging techniques were essential in identifying and resolving various issues throughout the development process. The systematic approach to debugging, combined with proper logging and error handling, helped maintain code quality and ensure reliable test execution.

The debugging process revealed several important lessons:

1. **Consistency is key** - Ensure consistent configuration across environments
2. **Isolation matters** - Proper test isolation prevents interference
3. **Logging helps** - Strategic logging provides valuable debugging information
4. **Async handling** - Proper async/await usage is crucial for reliable tests
5. **Resource management** - Always clean up resources to prevent leaks
