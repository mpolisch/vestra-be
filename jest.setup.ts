// Set required env vars before any module is evaluated.
// Module-level constants (e.g. JWT_SECRET in services/auth.ts) are captured
// at load time, so this must run before jest.mock() hoisting takes effect.
process.env.JWT_SECRET = 'test-secret';
