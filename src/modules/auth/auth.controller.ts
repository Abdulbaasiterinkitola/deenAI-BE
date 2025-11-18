import { Body, Controller, HttpCode, Logger, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { RegisterBodyValidator } from './validators/register.validator';
import { RegisterDocs } from './docs/register.doc';
import { ForgotPasswordBodyValidator } from './validators/forgotPassword.validator';
import { ForgotPasswordDocs } from './docs/forgotPassword.doc';
import { LoginDocs } from './docs/login.doc';
import { LoginBodyValidator } from './validators/login.validator';
import { GoogleAuthValidator } from './validators/google-auth.validator';
import { GoogleAuthDocs } from './docs/google-auth.doc';
import { ResetPasswordBodyValidator } from './validators/reset-password.validator';
import { ResetPasswordDocs } from './docs/reset-password.doc';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @HttpCode(201)
  @Post('/register')
  @RegisterDocs.register()
  async createNewUser(@Body() user: RegisterBodyValidator) {
    return await this.authService.registerWithEmailAndPassword(user);
  }

  @HttpCode(200)
  @Post('/forgot-password')
  @ForgotPasswordDocs.forgotPassword()
  async forgotPassword(
    @Body() body: ForgotPasswordBodyValidator,
    @Req() req: Request,
  ) {
    return await this.authService.forgotPassword(body, req.headers['referer']);
  }

  @Post('/login')
  @LoginDocs.login()
  async login(@Body() user: LoginBodyValidator) {
    return await this.authService.login(user);
  }

  @HttpCode(200)
  @Post('google')
  @GoogleAuthDocs.googleAuth()
  async googleLogin(@Body() googleAuthDto: GoogleAuthValidator) {
    return await this.authService.googleLogin(googleAuthDto.idToken);
  }
  @HttpCode(200)
  @Post('/reset-password')
  @ResetPasswordDocs.resetPassword()
  async resetPassword(@Body() body: ResetPasswordBodyValidator) {
    return await this.authService.resetPassword(body);
  }
}
