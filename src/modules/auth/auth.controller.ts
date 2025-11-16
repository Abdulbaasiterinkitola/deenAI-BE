import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { RegisterBodyValidator } from './validators/register.validator';
import { RegisterDocs } from './docs/register.doc';

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
}
