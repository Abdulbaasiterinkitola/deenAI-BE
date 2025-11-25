import { registerAs } from '@nestjs/config';

type AuthConfig = {
  jwtSecret: string;
  jwtExpiry: string;
  googleClientId?: string;
  appleClientId?: string;
  androidClientId?: string;
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
  jwtExpiry: process.env.JWT_TIMEFRAME || '6M',
  refreshSecret: getRequiredEnv('JWT_SECRET'),
  refreshExpiry: process.env.JWT_TIMEFRAME || '6M',
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  appleClientId: process.env.APPLE_CLIENT_ID,
  androidClientId: process.env.ANDRIOD_CLIENT_ID,
});

export default registerAs('auth', buildAuthConfig);
