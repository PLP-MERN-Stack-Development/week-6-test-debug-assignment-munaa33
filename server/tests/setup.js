// server/tests/setup.js - Server-side test setup

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup in-memory MongoDB for all tests
beforeAll(async () => {
  // Disconnect any existing connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Clean up after all tests
afterAll(async () => {
  // Give time for any pending operations to complete
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Disconnect from database
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  // Stop MongoDB server
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Clean up database between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Global test timeout
jest.setTimeout(30000);

// Suppress console logs during tests
const originalLog = console.log;
const originalError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalLog;
  console.error = originalError;
}); 