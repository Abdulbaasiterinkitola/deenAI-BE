import { AbstractBaseEntity } from '@entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('contact_submissions')
export class ContactSubmission extends AbstractBaseEntity {
  @Column({
    type: 'uuid',
    default: () => 'uuid_generate_v4()',
    unique: true,
  })
  identifier: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'text' })
  content: string;
}
