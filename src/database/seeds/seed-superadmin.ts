import dataSource, { initializeDataSource } from '@database/data-source';
import { User } from '@modules/users/models/user.model';
import { Profile } from '@modules/profile/models/profile.model';
import { AuthProvider } from '@modules/users/enums';
import { UserStatus } from '@modules/users/enums/user-status.enum';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';

const generateUsername = (name: string, userId: string): string => {
  const base = name?.replace(/\s+/g, '').toLowerCase() || 'user';
  const suffix = userId.replace(/-/g, '').slice(-6);
  return `${base}_${suffix}`;
};

const ensureProfileExists = async (
  userId: string,
  userName: string,
): Promise<void> => {
  const profileRepository = dataSource.getRepository(Profile);
  const existingProfile = await profileRepository.findOne({
    where: { userId },
  });

  if (!existingProfile) {
    let username = generateUsername(userName, userId).toLowerCase();
    
    // Ensure username is unique (very unlikely but handle edge case)
    let counter = 0;
    while (counter < 10) {
      const existingProfileWithUsername = await profileRepository.findOne({
        where: { username },
      });
      
      if (!existingProfileWithUsername) {
        break;
      }
      
      // If username exists, append a number
      username = `${generateUsername(userName, userId).toLowerCase()}${counter}`;
      counter++;
    }
    
    const profile = profileRepository.create({
      userId,
      username,
      avatar: null,
      language: null,
    });
    await profileRepository.save(profile);
  }
};

export const seedSuperadmin = async () => {
  const logger = new Logger('SuperadminSeed');

  const superadminEmail = process.env.SUPERADMIN_EMAIL;
  const superadminPassword = process.env.SUPERADMIN_PASSWORD;

  if (!superadminEmail || !superadminPassword) {
    logger.log(
      'Superadmin email or password not found in .env, skipping superadmin seeding',
    );
    return;
  }

  if (!dataSource.isInitialized) {
    await initializeDataSource();
  }

  const userRepository = dataSource.getRepository(User);

  const existingSuperadmin = await userRepository.findOne({
    where: { isSuperadmin: true },
  });

  if (existingSuperadmin) {
    logger.log('Superadmin already exists, ensuring profile exists');
    await ensureProfileExists(existingSuperadmin.id, existingSuperadmin.name);
    logger.log('Superadmin profile ensured');
    return;
  }

  const existingUser = await userRepository.findOne({
    where: { email: superadminEmail },
  });

  if (existingUser) {
    logger.log(
      `User with email ${superadminEmail} already exists. Updating to superadmin.`,
    );
    existingUser.isSuperadmin = true;
    await userRepository.save(existingUser);
    await ensureProfileExists(existingUser.id, existingUser.name);
    logger.log('User updated to superadmin and profile ensured');
    return;
  }

  const hashedPassword = await bcrypt.hash(superadminPassword, 10);

  const superadmin = userRepository.create({
    name: 'Super Admin',
    email: superadminEmail,
    password: hashedPassword,
    authProvider: AuthProvider.LOCAL,
    isEmailVerified: true,
    status: UserStatus.ACTIVE,
    isSuperadmin: true,
  });

  const savedSuperadmin = await userRepository.save(superadmin);
  await ensureProfileExists(savedSuperadmin.id, savedSuperadmin.name);
  logger.log(
    `Superadmin created successfully with email: ${superadminEmail} and profile created`,
  );
};

// Allow running this seed standalone: `ts-node src/database/seeds/seed-superadmin.ts`
if (require.main === module) {
  seedSuperadmin()
    .then(() => {
      console.log('Superadmin seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Superadmin seeding failed', error);
      process.exit(1);
    });
}
