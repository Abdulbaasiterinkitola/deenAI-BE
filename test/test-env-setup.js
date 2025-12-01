// Set required environment variables for tests
process.env.NODE_ENV = 'test';
process.env.DB_USERNAME = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.JWT_SECRET = 'test-secret-key';
process.env.MAIL_HOST = 'test';
process.env.MAIL_PORT = '587';
process.env.MAIL_USER = 'test';
process.env.MAIL_PASS = 'test';
process.env.MAIL_FROM = 'test@example.com';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.GEMINI_API_KEY = 'test-key';

