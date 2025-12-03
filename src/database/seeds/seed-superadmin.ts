import dataSource, { initializeDataSource } from '@database/data-source';
import { User } from '@modules/users/models/user.model';
import { AuthProvider } from '@modules/users/enums';
import { UserStatus } from '@modules/users/enums/user-status.enum';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';

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
    logger.log('Superadmin already exists, skipping seeding');
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
    logger.log('User updated to superadmin');
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

  await userRepository.save(superadmin);
  logger.log(`Superadmin created successfully with email: ${superadminEmail}`);
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
