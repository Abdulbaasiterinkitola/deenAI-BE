import { registerAs } from '@nestjs/config';
import { StringValue } from 'ms';

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: (process.env.JWT_TIMEFRAME || '3d') as StringValue,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  appleClientId: process.env.APPLE_CLIENT_ID,
}));

