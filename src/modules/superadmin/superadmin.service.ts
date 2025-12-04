import { Injectable } from '@nestjs/common';
import { SuperAdminUserCrudService } from './services/superadmin-crud.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserListQueryDto } from './dtos/user-list-query.dto';
import { SuperadminCrudValidator } from './services/super-admin-crud-validation.service';

@Injectable()
export class SuperadminService {
  constructor(
    private readonly superAdminUserCrudService: SuperAdminUserCrudService,
    private readonly validator: SuperadminCrudValidator,
  ) {}

  async listUsers(queryDto: UserListQueryDto) {
    return this.superAdminUserCrudService.listUsers(queryDto);
  }

  async getUserById(userId: string) {
    await this.validator.validateUserExists(userId);
    return this.superAdminUserCrudService.getUserById(userId);
  }

  async createUser(createUserDto: CreateUserDto, adminUserId: string) {
    await this.validator.validateEmailUniqueness(createUserDto.email);

    return this.superAdminUserCrudService.createUser(
      createUserDto,
      adminUserId,
    );
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
    adminUserId: string,
  ) {
    this.validator.validateNotSelfAction(userId, adminUserId, 'update');

    if (updateUserDto.email) {
      await this.validator.validateEmailUniqueness(updateUserDto.email, userId);
    }

    return this.superAdminUserCrudService.updateUser(
      userId,
      updateUserDto,
      adminUserId,
    );
  }

  async deleteUser(userId: string, adminUserId: string) {
    await this.validator.validateUserExists(userId);
    this.validator.validateNotSelfAction(userId, adminUserId, 'delete');

    return this.superAdminUserCrudService.deleteUser(userId, adminUserId);
  }

  async activateUser(userId: string, adminUserId: string) {
    const user = await this.validator.validateUserExists(userId);
    this.validator.validateNotSelfAction(userId, adminUserId, 'activate');
    this.validator.validateUserCanBeActivated(user);

    return this.superAdminUserCrudService.activateUser(userId, adminUserId);
  }

  async deactivateUser(userId: string, adminUserId: string) {
    const user = await this.validator.validateUserExists(userId);
    this.validator.validateNotSelfAction(userId, adminUserId, 'deactivate');
    this.validator.validateUserCanBeDeactivated(user);

    return this.superAdminUserCrudService.deactivateUser(userId, adminUserId);
  }

  async resetUserPassword(userId: string, adminUserId: string) {
    await this.validator.validateUserExists(userId);
    this.validator.validateNotSelfAction(userId, adminUserId, 'reset password');

    return this.superAdminUserCrudService.resetUserPassword(
      userId,
      adminUserId,
    );
  }

  async promoteToSuperadmin(userId: string, adminUserId: string) {
    const user = await this.validator.validateUserExists(userId);
    this.validator.validateNotSelfAction(userId, adminUserId, 'promote');
    this.validator.validateUserCanBePromoted(user);

    return this.superAdminUserCrudService.promoteToSuperadmin(
      userId,
      adminUserId,
    );
  }

  async demoteFromSuperadmin(userId: string, adminUserId: string) {
    const user = await this.validator.validateUserExists(userId);
    this.validator.validateNotSelfAction(userId, adminUserId, 'demote');
    this.validator.validateUserCanBeDemoted(user);

    return this.superAdminUserCrudService.demoteFromSuperadmin(
      userId,
      adminUserId,
    );
  }
}
