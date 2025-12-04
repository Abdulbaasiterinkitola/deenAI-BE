import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';

import { AuthUser } from '@guards/auth-user.decorator';
import { User } from '@modules/users/models/user.model';

import { SuperadminGuard } from '@guards/superadmin.guard';
import { ApiTags } from '@nestjs/swagger';
import { SuperadminDocs } from '../docs/superadmin.doc';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserListQueryDto } from '../dtos/user-list-query.dto';
import { SuperadminService } from '../superadmin.service';

@ApiTags('Superadmin CRUD')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('superadmin/users')
@UseGuards(SuperadminGuard)
export class SuperadminCrudController {
  constructor(private readonly superadminService: SuperadminService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @SuperadminDocs.listUsers()
  async listUsers(@Query() query: UserListQueryDto) {
    return this.superadminService.listUsers(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @SuperadminDocs.getUserById()
  async getUserById(@Param('id') userId: string) {
    return this.superadminService.getUserById(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @SuperadminDocs.createUser()
  async createUser(
    @AuthUser() admin: User,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.superadminService.createUser(createUserDto, admin.id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @SuperadminDocs.updateUser()
  async updateUser(
    @Param('id') userId: string,
    @AuthUser() admin: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.superadminService.updateUser(userId, updateUserDto, admin.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @SuperadminDocs.deleteUser()
  async deleteUser(@Param('id') userId: string, @AuthUser() admin: User) {
    return this.superadminService.deleteUser(userId, admin.id);
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  @SuperadminDocs.activateUser()
  async activateUser(@Param('id') userId: string, @AuthUser() admin: User) {
    return this.superadminService.activateUser(userId, admin.id);
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @SuperadminDocs.deactivateUser()
  async deactivateUser(@Param('id') userId: string, @AuthUser() admin: User) {
    return this.superadminService.deactivateUser(userId, admin.id);
  }

  @Post(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  @SuperadminDocs.resetUserPassword()
  async resetUserPassword(
    @Param('id') userId: string,
    @AuthUser() admin: User,
  ) {
    return this.superadminService.resetUserPassword(userId, admin.id);
  }

  @Patch(':id/promote')
  @HttpCode(HttpStatus.OK)
  @SuperadminDocs.promoteToSuperadmin()
  async promoteToSuperadmin(
    @Param('id') userId: string,
    @AuthUser() admin: User,
  ) {
    return this.superadminService.promoteToSuperadmin(userId, admin.id);
  }

  @Patch(':id/demote')
  @HttpCode(HttpStatus.OK)
  @SuperadminDocs.demoteFromSuperadmin()
  async demoteFromSuperadmin(
    @Param('id') userId: string,
    @AuthUser() admin: User,
  ) {
    return this.superadminService.demoteFromSuperadmin(userId, admin.id);
  }
}
