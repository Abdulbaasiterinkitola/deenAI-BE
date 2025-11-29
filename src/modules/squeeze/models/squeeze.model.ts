import { AbstractBaseEntity } from '@entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('squeeze')
export class Squeeze extends AbstractBaseEntity {
  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  name?: string;
}
