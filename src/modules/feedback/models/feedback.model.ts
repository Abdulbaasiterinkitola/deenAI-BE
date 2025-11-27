import { AbstractBaseEntity } from '@entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'feedbacks' })
export class Feedback extends AbstractBaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  description: string;
}
