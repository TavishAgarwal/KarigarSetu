import '@testing-library/jest-dom/vitest';

// Mock environment variables for tests
process.env.JWT_SECRET = 'test-secret-key-for-unit-tests-only';
process.env.DATABASE_URL = 'file:./test.db';
process.env.GEMINI_API_KEY = 'test-gemini-key';
