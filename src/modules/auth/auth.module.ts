import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '@modules/users/users.module';
import { LocalAuthService } from './services/local.service';
import { GoogleAuthService } from './services/google.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailServiceModule } from '@modules/email/email.module';
import { AuthGuard } from './guards/auth.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, LocalAuthService, GoogleAuthService],
  imports: [
    EmailServiceModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwtSecret'),
        signOptions: {
          expiresIn: configService.get<string>('auth.jwtExpiry'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [AuthGuard, JwtModule],
})
export class AuthModule {}
