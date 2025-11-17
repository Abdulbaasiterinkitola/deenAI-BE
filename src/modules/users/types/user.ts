import { AuthProvider } from '../enums';

export type UserType = {
  name: string;
  email: string;
  password: string;
  authProvider: AuthProvider;
  isEmailVerified: boolean;
};

export type ResetPasswordEmailOptions = {
  to: string;
  name?: string;
  resetLink: string;
  expiresIn?: string;
};
