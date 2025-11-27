import { Injectable } from '@nestjs/common';

@Injectable()
export class FeedbackNameHelperService {
  /**
   * Extracts a display name from a user object, with fallback to 'anonymous'
   * @param user - User object from request (may be undefined for unauthenticated users)
   * @returns Display name string
   */
  extractNameFromUser(user: any): string {
    if (!user || typeof user !== 'object') {
      return 'anonymous';
    }

    // Try various name fields in order of preference
    if (typeof user.name === 'string' && user.name.trim()) {
      return user.name.trim() as string;
    }

    if (typeof user.fullName === 'string' && user.fullName.trim()) {
      return user.fullName.trim() as string;
    }

    if (typeof user.full_name === 'string' && user.full_name.trim()) {
      return user.full_name.trim() as string;
    }

    if (typeof user.username === 'string' && user.username.trim()) {
      return user.username.trim() as string;
    }

    // Extract name from email if available
    if (typeof user.email === 'string' && user.email.includes('@')) {
      const emailName = user.email.split('@')[0];
      if (emailName && emailName.trim()) {
        return emailName.trim() as string;
      }
    }

    // Check profile if available
    if (user.profile) {
      if (typeof user.profile.name === 'string' && user.profile.name.trim()) {
        return user.profile.name.trim() as string;
      }
      if (
        typeof user.profile.fullName === 'string' &&
        user.profile.fullName.trim()
      ) {
        return user.profile.fullName.trim() as string;
      }
    }

    return 'anonymous';
  }
}
