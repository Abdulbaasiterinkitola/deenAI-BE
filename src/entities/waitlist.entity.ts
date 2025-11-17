import { Entity, Column } from 'typeorm';
import { AbstractBaseEntity } from './base.entity';

@Entity('waitlist')
export class Waitlist extends AbstractBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;
}
