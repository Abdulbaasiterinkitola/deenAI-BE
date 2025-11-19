import { registerAs } from '@nestjs/config';

type AuthConfig = {
  jwtSecret: string;
  jwtExpiry: string;
  googleClientId?: string;
  appleClientId?: string;
  refreshSecret?: string;
  refreshExpiry?: string;
};

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};

const buildAuthConfig = (): AuthConfig => ({
  jwtSecret: getRequiredEnv('JWT_SECRET'),
  jwtExpiry: process.env.JWT_TIMEFRAME || '3d',
  refreshSecret: getRequiredEnv('JWT_SECRET'),
  refreshExpiry: process.env.JWT_TIMEFRAME || '3d',
  googleClientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID,
  appleClientId: process.env.APPLE_CLIENT_ID,
});

export default registerAs('auth', buildAuthConfig);
