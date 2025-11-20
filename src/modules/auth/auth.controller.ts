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
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RegisterBodyValidator } from './validators/register.validator';
import { LoginBodyValidator } from './validators/login.validator';
import { GoogleAuthValidator } from './validators/google-auth.validator';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { RequestOtpDto } from './dtos/forgot-password.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { ResetPasswordService } from './services/reset-password.service';
import { AuthGuard } from './guards/auth.guard';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
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
  async createNewUser(@Body() user: RegisterBodyValidator) {
    return await this.authService.registerWithEmailAndPassword(user);
  }

  @HttpCode(200)
  @Post('/login')
  async login(@Body() user: LoginBodyValidator) {
    return await this.authService.login(user);
  }

  @HttpCode(200)
  @Post('/google')
  async googleLogin(@Body() googleAuthDto: GoogleAuthValidator) {
    return await this.authService.googleLogin(googleAuthDto.idToken);
  }
  @HttpCode(200)
  @Post('forgot-password')
  @ApiOperation({ summary: 'Forgot password' })
  @ApiResponse({ status: 200, description: 'Request password reset OTP' })
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.resetPasswordService.requestOtp(dto.email);
  }

  @HttpCode(200)
  @Post('verify-otp')
  @ApiOperation({
    summary:
      'Verify OTP for various purposes (password reset, email verification, etc.)',
  })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.resetPasswordService.verifyOtp(dto.email, dto.otp);
  }

  @HttpCode(200)
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using OTP' })
  @ApiResponse({ status: 200, description: 'Password successfully reset' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.resetPasswordService.resetPassword(
      dto.email,
      dto.otp,
      dto.newPassword,
    );
  }

  @HttpCode(200)
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh Access Token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
  async refreshTokens(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @HttpCode(200)
  @Post('logout')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  async logout(@Req() req: any) {
    const user = req.user;
    return this.authService.logout(user.id);
  }
}
