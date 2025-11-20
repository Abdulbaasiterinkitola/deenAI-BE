// users/dtos/user-profile.dto.ts

import { Exclude, Expose, plainToInstance } from 'class-transformer';
import { User } from '../models/user.model';

@Exclude()
export class UserProfileDto {
  @Expose({ name: 'id' })
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose({ name: 'created_at' })
  createdAt: Date = new Date();

  @Expose({ name: 'updated_at' })
  updatedAt: Date = new Date();

  static fromEntity(user: User): UserProfileDto {
    const dto = plainToInstance(UserProfileDto, user, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
      enableImplicitConversion: true,
    });

    return dto;
  }
}
