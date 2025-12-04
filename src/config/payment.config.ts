import { registerAs } from '@nestjs/config';

export default registerAs('payment', () => ({
  google: {
    serviceAccountJson: process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON,
  },
  apple: {
    sharedSecret: process.env.APPLE_SHARED_SECRET,
    bundleId: process.env.APPLE_BUNDLE_ID,
    environment:
      process.env.NODE_ENV === 'production' ? 'Production' : 'Sandbox',
  },
}));
