import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '@modules/users/users.module';
import { LocalAuthService } from './services/local.service';
import { GoogleAuthService } from './services/google.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import { AuthGuard } from './guards/auth.guard';

@Module({
  controllers: [AuthController],
<<<<<<< HEAD
  providers: [AuthService, LocalAuthService, AuthGuard],
=======
  providers: [AuthService, LocalAuthService, GoogleAuthService],
>>>>>>> 7b5622d97bcab8e39188d86b8dfa5e08e04dbdf4
  imports: [
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
  exports: [AuthGuard, JwtModule],
})
export class AuthModule {}
