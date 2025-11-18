import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { RegisterBodyValidator } from './validators/register.validator';
import { RegisterDocs } from './docs/register.doc';
import { LoginDocs } from './docs/login.doc';
<<<<<<< HEAD
import { LoginBodyValidator } from './validators/login.validator';
=======
import { GoogleAuthValidator } from './validators/google-auth.validator';
import { GoogleAuthDocs } from './docs/google-auth.doc';
>>>>>>> 7b5622d97bcab8e39188d86b8dfa5e08e04dbdf4

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
}
