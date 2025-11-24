import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ProfileModelAction } from './profile.model-action';
import { ProfileValidationService } from './services/profile-validation.service';
import { ProfileCoreService } from './services/profile-core.service';
import { Profile } from './models/profile.model';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { ProfileAvatarService } from './services/profile-avatar.service';

@Module({
  imports: [TypeOrmModule.forFeature([Profile]), AuthModule, UsersModule],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    ProfileModelAction,
    ProfileValidationService,
    ProfileCoreService,
    ProfileAvatarService,
  ],
  exports: [ProfileService, ProfileModelAction], // Export if other modules need to use it
})
export class ProfileModule {}
