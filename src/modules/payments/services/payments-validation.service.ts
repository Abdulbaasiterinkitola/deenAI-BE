import { Injectable, HttpStatus } from '@nestjs/common';
import { CustomHttpException } from '@shared/custom.exception';
import { UsersService } from '@modules/users/users.service';

@Injectable()
export class PaymentsValidationService {
  constructor(private readonly usersService: UsersService) {}

  async validateUserExists(userId: string) {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }
}
