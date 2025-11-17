import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import UserCoreService from './services/user-core.service';
import UserValidationService from './services/user-validation.service';
import { UserModelAction } from './action-models/user.action-model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.model';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserCoreService,
    UserValidationService,
    UserModelAction,
  ],
  exports: [UsersService, UserValidationService],
})
export class UsersModule {}
