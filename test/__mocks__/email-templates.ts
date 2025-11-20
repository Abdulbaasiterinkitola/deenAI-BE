// Mock email templates to avoid React TSX parsing issues in tests

export const WaitlistEmail = jest
  .fn()
  .mockReturnValue('<div>Waitlist Email</div>');
export const WelcomeEmail = jest
  .fn()
  .mockReturnValue('<div>Welcome Email</div>');
export const OtpEmail = jest.fn().mockReturnValue('<div>OTP Email</div>');

export default {
  WaitlistEmail,
  WelcomeEmail,
  OtpEmail,
};
