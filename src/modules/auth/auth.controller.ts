import { Body, Controller, HttpCode, Logger, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { RegisterBodyValidator } from './validators/register.validator';
import { LoginBodyValidator } from './validators/login.validator';
import { GoogleAuthValidator } from './validators/google-auth.validator';
import { AppleAuthValidator } from './validators/apple-auth.validator';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { RequestOtpDto } from './dtos/forgot-password.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { Throttle } from '@nestjs/throttler';
import { ResetPasswordService } from './services/reset-password.service';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { Public } from '@guards/public.decorator';
import {
  RegisterDocs,
  LoginDocs,
  GoogleAuthDocs,
  AppleAuthDocs,
  ForgotPasswordDocs,
  VerifyOtpDocs,
  ResetPasswordDocs,
  RefreshDocs,
  LogoutDocs,
} from './docs';
@Controller('auth')
@ApiTags('Authentication')
@Throttle({
  default: { limit: 15, ttl: 60 * 1000 }, // 15 requests per minute
})
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly authService: AuthService,
    private readonly resetPasswordService: ResetPasswordService,
  ) {}

  @HttpCode(201)
  @Post('/register')
  @Public()
  @RegisterDocs.register()
  async createNewUser(@Body() user: RegisterBodyValidator) {
    return await this.authService.registerWithEmailAndPassword(user);
  }

  @HttpCode(200)
  @Post('/login')
  @Public()
  @LoginDocs.login()
  async login(@Body() user: LoginBodyValidator) {
    return await this.authService.login(user);
  }

  @HttpCode(200)
  @Post('/google')
  @Public()
  @GoogleAuthDocs.googleAuth()
  async googleLogin(@Body() googleAuthDto: GoogleAuthValidator) {
    return await this.authService.googleLogin(
      googleAuthDto.idToken,
      googleAuthDto.platform,
    );
  }

  @HttpCode(200)
  @Post('/apple')
  @AppleAuthDocs.appleAuth()
  async appleLogin(@Body() appleAuthDto: AppleAuthValidator) {
    return await this.authService.appleLogin(appleAuthDto.idToken);
  }
  @HttpCode(200)
  @Post('forgot-password')
  @Public()
  @ForgotPasswordDocs.forgotPassword()
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.resetPasswordService.requestOtp(dto.email);
  }

  @HttpCode(200)
  @Post('verify-otp')
  @Public()
  @VerifyOtpDocs.verifyOtp()
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.resetPasswordService.verifyOtp(dto.email, dto.otp);
  }

  @HttpCode(200)
  @Post('reset-password')
  @Public()
  @ResetPasswordDocs.resetPassword()
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.resetPasswordService.resetPassword(
      dto.email,
      dto.otp,
      dto.newPassword,
    );
  }

  @HttpCode(200)
  @Post('refresh')
  @Public()
  @RefreshDocs.refresh()
  async refreshTokens(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @HttpCode(200)
  @Post('logout')
  @LogoutDocs.logout()
  async logout(@Req() req: any) {
    const user = req.user;
    return this.authService.logout(user.id as string);
  }
}
