import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ProfileModelAction } from './profile.model-action';
import { ProfileValidationService } from './services/profile-validation.service';
import { ProfileCoreService } from './services/profile-core.service';
import { Profile } from './models/profile.model';
import { User } from '@modules/users/models/user.model';
import { UsersModule } from '@modules/users/users.module';
import { ProfileAvatarService } from './services/profile-avatar.service';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModelAction } from '@modules/users/action-models/user.action-model';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, User]),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    ProfileModelAction,
    UserModelAction,
    ProfileValidationService,
    ProfileCoreService,
    ProfileAvatarService,
  ],
  exports: [ProfileService, ProfileModelAction],
})
export class ProfileModule {}
