import { AuthProvider } from '../enums';
import { UserStatus } from '../enums/user-status.enum';

export type UserType = {
  name: string;
  email: string;
  password: string;
  authProvider: AuthProvider;
  isEmailVerified: boolean;
  status: UserStatus;
  plan?: string; // For filtering
};

export type ResetPasswordEmailOptions = {
  to: string;
  name?: string;
  resetLink: string;
  expiresIn?: string;
};
