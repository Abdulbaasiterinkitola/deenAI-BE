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
  @ApiOperation({ summary: 'Register new user account' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        success: true,
        status: 'success',
        message:
          'User registered successfully. Please check your email for verification.',
        data: {
          user: {
            id: '7f44fb53-450c-4b7b-bcb7-7fe33c56ad68',
            name: 'John Doe',
            email: 'user@example.com',
            authProvider: 'local',
            isEmailVerified: false,
            createdAt: '2025-11-20T19:02:39.633Z',
            updatedAt: '2025-11-20T19:02:39.633Z',
          },
        },
        status_code: 201,
      },
    },
  })
  async createNewUser(@Body() user: RegisterBodyValidator) {
    return await this.authService.registerWithEmailAndPassword(user);
  }

  @HttpCode(200)
  @Post('verify-email')
  @ApiOperation({
    summary: 'Verify email address using OTP sent during registration',
    description:
      'Verifies the user email address with OTP and sends welcome email upon successful verification',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    schema: {
      example: {
        success: true,
        status: 'success',
        message: 'Email verified successfully',
        status_code: 200,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired OTP / Email already verified',
    schema: {
      example: {
        success: false,
        message: 'Invalid or expired OTP',
        status_code: 400,
      },
    },
  })
  async verifyEmail(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyEmail(dto);
  }

  @HttpCode(200)
  @Post('resend-verification')
  @ApiOperation({
    summary: 'Resend email verification OTP',
    description:
      'Resends verification OTP to user email if account exists and is not yet verified',
  })
  @ApiResponse({
    status: 200,
    description: 'Verification OTP resent successfully',
    schema: {
      example: {
        success: true,
        status: 'success',
        message: 'Verification OTP resent successfully',
        status_code: 200,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Email already verified or user not found',
    schema: {
      example: {
        success: false,
        message: 'Email is already verified',
        status_code: 400,
      },
    },
  })
  async resendVerificationOtp(@Body() dto: RequestOtpDto) {
    return this.authService.resendVerificationOtp(dto.email);
  }

  @HttpCode(200)
  @Post('/login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        success: true,
        status: 'success',
        message: 'Login successful',
        data: {
          tokens: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          user: {
            id: '7f44fb53-450c-4b7b-bcb7-7fe33c56ad68',
            name: 'John Doe',
            email: 'user@example.com',
            authProvider: 'local',
            isEmailVerified: true,
            createdAt: '2025-11-20T19:02:39.633Z',
            updatedAt: '2025-11-20T19:04:58.434Z',
          },
        },
        status_code: 200,
      },
    },
  })
  async login(@Body() user: LoginBodyValidator) {
    return await this.authService.login(user);
  }

  @HttpCode(200)
  @Post('/google')
  @ApiOperation({ summary: 'Google OAuth login' })
  @ApiResponse({
    status: 200,
    description: 'Google login successful',
    schema: {
      example: {
        success: true,
        status: 'success',
        message: 'Google login successful',
        data: {
          tokens: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          user: {
            id: '7f44fb53-450c-4b7b-bcb7-7fe33c56ad68',
            name: 'John Doe',
            email: 'user@example.com',
            authProvider: 'google',
            isEmailVerified: true,
          },
        },
        status_code: 200,
      },
    },
  })
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
    summary: 'Verify OTP for password reset purposes',
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
