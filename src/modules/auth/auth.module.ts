import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '@modules/users/users.module';
import { LocalAuthService } from './services/local.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, LocalAuthService],
  imports: [UsersModule],
})
export class AuthModule {}
