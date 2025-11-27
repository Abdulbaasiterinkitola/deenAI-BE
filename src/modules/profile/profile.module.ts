import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ProfileModelAction } from './profile.model-action';
import { ProfileValidationService } from './services/profile-validation.service';
import { ProfileCoreService } from './services/profile-core.service';
import { Profile } from './models/profile.model';
import { User } from '@modules/users/models/user.model';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, User]), AuthModule, UsersModule],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    ProfileModelAction,
    ProfileValidationService,
    ProfileCoreService,
  ],
  exports: [ProfileService, ProfileModelAction], // Export if other modules need to use it
})
export class ProfileModule {}
