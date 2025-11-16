import { AbstractBaseEntity } from '@entities/base.entity';
import { Column, Entity } from 'typeorm';
import { AuthProvider } from '../enums';

@Entity({ name: 'users' })
export class User extends AbstractBaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
    nullable: false,
  })
  authProvider: AuthProvider;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;
}
