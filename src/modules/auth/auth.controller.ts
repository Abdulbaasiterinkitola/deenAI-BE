import {
  Body,
  Controller,
  HttpCode,
  Logger,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { RegisterBodyValidator } from './validators/register.validator';
import { LoginBodyValidator } from './validators/login.validator';
import { GoogleAuthValidator } from './validators/google-auth.validator';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { RequestOtpDto } from './dtos/forgot-password.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { ResetPasswordService } from './services/reset-password.service';
import { AuthGuard } from './guards/auth.guard';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import {
  RegisterDocs,
  VerifyEmailDocs,
  ResendVerificationDocs,
  LoginDocs,
  GoogleAuthDocs,
  ForgotPasswordDocs,
  VerifyOtpDocs,
  ResetPasswordDocs,
  RefreshDocs,
  LogoutDocs,
} from './docs';
@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly authService: AuthService,
    private readonly resetPasswordService: ResetPasswordService,
  ) {}

  @HttpCode(201)
  @Post('/register')
  @RegisterDocs.register()
  async createNewUser(@Body() user: RegisterBodyValidator) {
    return await this.authService.registerWithEmailAndPassword(user);
  }

  @HttpCode(200)
  @Post('verify-email')
  @VerifyEmailDocs.verifyEmail()
  async verifyEmail(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyEmail(dto);
  }

  @HttpCode(200)
  @Post('resend-verification')
  @ResendVerificationDocs.resendVerification()
  async resendVerificationOtp(@Body() dto: RequestOtpDto) {
    return this.authService.resendVerificationOtp(dto.email);
  }

  @HttpCode(200)
  @Post('/login')
  @LoginDocs.login()
  async login(@Body() user: LoginBodyValidator) {
    return await this.authService.login(user);
  }

  @HttpCode(200)
  @Post('/google')
  @GoogleAuthDocs.googleAuth()
  async googleLogin(@Body() googleAuthDto: GoogleAuthValidator) {
    return await this.authService.googleLogin(googleAuthDto.idToken);
  }
  @HttpCode(200)
  @Post('forgot-password')
  @ForgotPasswordDocs.forgotPassword()
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.resetPasswordService.requestOtp(dto.email);
  }

  @HttpCode(200)
  @Post('verify-otp')
  @VerifyOtpDocs.verifyOtp()
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.resetPasswordService.verifyOtp(dto.email, dto.otp);
  }

  @HttpCode(200)
  @Post('reset-password')
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
  @RefreshDocs.refresh()
  async refreshTokens(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @HttpCode(200)
  @Post('logout')
  @UseGuards(AuthGuard)
  @LogoutDocs.logout()
  async logout(@Req() req: any) {
    const user = req.user;
    return this.authService.logout(user.id as string);
  }
}
