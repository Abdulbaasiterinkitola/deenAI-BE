import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UserModelAction } from '@modules/users/action-models/user.action-model';
import UserValidationService from '@modules/users/services/user-validation.service';
import { ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserListQueryDto } from '../dtos/user-list-query.dto';
import { UserStatus } from '@modules/users/enums/user-status.enum';
import { AuthProvider } from '@modules/users/enums';

@Injectable()
export class SuperAdminUserCrudService {
  private readonly logger = new Logger(SuperAdminUserCrudService.name);

  constructor(
    private readonly userModelAction: UserModelAction,
    private readonly userValidationService: UserValidationService,
  ) {}

  async listUsers(queryDto: UserListQueryDto) {
    const {
      page = 1,
      limit = 10,
      status,
      email,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    const filterOptions: any = {};

    if (status) {
      filterOptions.status = status;
    }

    if (email) {
      filterOptions.email = ILike(`%${email}%`);
    }

    if (search) {
      filterOptions.name = ILike(`%${search}%`);
    }

    const orderOptions: any = {
      [sortBy]: sortOrder,
    };

    const result = await this.userModelAction.list({
      filterRecordOptions: filterOptions,
      paginationPayload: { limit, page },
      relations: ['plan'],
      order: orderOptions,
    });

    this.logger.log(
      `Listed ${result.payload.length} users (page ${page}, limit ${limit})`,
    );

    return {
      users: result.payload,
      pagination: result.paginationMeta,
    };
  }

  async getUserById(userId: string) {
    const user = await this.userModelAction.get({ id: userId }, {}, ['plan']);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    this.logger.log(`Retrieved user ${userId}`);
    return user;
  }

  async createUser(createUserDto: CreateUserDto, adminUserId: string) {
    const {
      email,
      password,
      name,
      status,
      planId,
      isSuperadmin,
      isEmailVerified,
      authProvider,
    } = createUserDto;

    const normalizedEmail =
      this.userValidationService.normalizeAndValidateEmail(email);

    const existingUser = await this.userModelAction.get({
      email: normalizedEmail,
    });

    if (existingUser) {
      throw new ConflictException(
        `User with email ${normalizedEmail} already exists`,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.userModelAction.create({
      createPayload: {
        email: normalizedEmail,
        password: hashedPassword,
        name,
        status: status !== undefined ? status : UserStatus.ACTIVE,
        planId: planId || null,
        isSuperadmin: isSuperadmin || false,
        isEmailVerified:
          isEmailVerified !== undefined ? isEmailVerified : false,
        authProvider: authProvider || AuthProvider.LOCAL,
      },
    });

    this.logger.log(
      `AUDIT: Admin ${adminUserId} performed CREATE_USER on user ${newUser?.id}`,
    );

    return newUser;
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
    adminUserId: string,
  ) {
    const user = await this.getUserById(userId);

    const updatePayload: any = {};

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const normalizedEmail =
        this.userValidationService.normalizeAndValidateEmail(
          updateUserDto.email,
        );

      const existingUser = await this.userModelAction.get({
        email: normalizedEmail,
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException(
          `Email ${normalizedEmail} is already in use`,
        );
      }

      updatePayload.email = normalizedEmail;
    }

    if (updateUserDto.name !== undefined)
      updatePayload.name = updateUserDto.name;
    if (updateUserDto.planId !== undefined)
      updatePayload.planId = updateUserDto.planId;
    if (updateUserDto.isSuperadmin !== undefined)
      updatePayload.isSuperadmin = updateUserDto.isSuperadmin;
    if (updateUserDto.isEmailVerified !== undefined)
      updatePayload.isEmailVerified = updateUserDto.isEmailVerified;

    const updatedUser = await this.userModelAction.update({
      updatePayload,
      identifierOptions: { id: userId },
    });

    this.logger.log(
      `AUDIT: Admin ${adminUserId} performed UPDATE_USER on user ${userId}`,
    );

    return updatedUser;
  }

  async deleteUser(userId: string, adminUserId: string) {
    await this.getUserById(userId);

    await this.userModelAction.delete({
      identifierOptions: { id: userId },
    });

    this.logger.log(
      `AUDIT: Admin ${adminUserId} performed DELETE_USER on user ${userId}`,
    );

    return { success: true, message: 'User deleted successfully' };
  }

  async activateUser(userId: string, adminUserId: string) {
    const updatedUser = await this.userModelAction.update({
      updatePayload: { status: UserStatus.ACTIVE },
      identifierOptions: { id: userId },
    });

    this.logger.log(
      `AUDIT: Admin ${adminUserId} performed ACTIVATE_USER on user ${userId}`,
    );

    return updatedUser;
  }

  async deactivateUser(userId: string, adminUserId: string) {
    const updatedUser = await this.userModelAction.update({
      updatePayload: { status: UserStatus.PAUSED },
      identifierOptions: { id: userId },
    });

    this.logger.log(
      `AUDIT: Admin ${adminUserId} performed DEACTIVATE_USER on user ${userId}`,
    );

    return updatedUser;
  }

  async resetUserPassword(userId: string, adminUserId: string) {
    await this.getUserById(userId);

    const newPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userModelAction.update({
      updatePayload: { password: hashedPassword },
      identifierOptions: { id: userId },
    });

    this.logger.log(
      `AUDIT: Admin ${adminUserId} performed RESET_PASSWORD on user ${userId}`,
    );

    return {
      success: true,
      message: 'Password reset successfully',
      newPassword,
    };
  }

  async promoteToSuperadmin(userId: string, adminUserId: string) {
    const updatedUser = await this.userModelAction.update({
      updatePayload: { isSuperadmin: true },
      identifierOptions: { id: userId },
    });

    this.logger.log(
      `AUDIT: Admin ${adminUserId} performed PROMOTE_SUPERADMIN on user ${userId}`,
    );

    return updatedUser;
  }

  async demoteFromSuperadmin(userId: string, adminUserId: string) {
    const updatedUser = await this.userModelAction.update({
      updatePayload: { isSuperadmin: false },
      identifierOptions: { id: userId },
    });

    this.logger.log(
      `AUDIT: Admin ${adminUserId} performed DEMOTE_SUPERADMIN on user ${userId}`,
    );

    return updatedUser;
  }

  private generateRandomPassword(): string {
    const length = 12;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}
