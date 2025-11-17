import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '@modules/users/users.module';
import { LocalAuthService } from './services/local.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import { EmailServiceModule } from '@modules/email/email.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, LocalAuthService],
  imports: [
    EmailServiceModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwtSecret'),
        signOptions: {
          expiresIn: configService.get<StringValue>('auth.jwtExpiry'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AuthModule {}
