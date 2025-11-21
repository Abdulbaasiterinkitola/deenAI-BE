import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '@modules/users/users.module';
import { LocalAuthService } from './services/local.service';
import { GoogleAuthService } from './services/google.service';
import { AuthValidationService } from './services/auth-validation.service';
import { TokenService } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailServiceModule } from '@modules/email/email.module';
import { AuthGuard } from '@guards/auth.guard';
import { OtpService } from './services/otp.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResetPasswordService } from './services/reset-password.service';
import { PasswordResetOtp } from './models/otp.model';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalAuthService,
    GoogleAuthService,
    TokenService,
    AuthGuard,
    OtpService,
    ResetPasswordService,
    AuthValidationService,
  ],
  imports: [
    EmailServiceModule,
    UsersModule,
    TypeOrmModule.forFeature([PasswordResetOtp]),
    forwardRef(() => UsersModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwtSecret'),
        signOptions: {
          expiresIn: configService.get<string>('auth.jwtExpiry') as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [AuthGuard, JwtModule],
})
export class AuthModule {}
