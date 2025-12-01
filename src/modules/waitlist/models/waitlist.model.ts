import { AbstractBaseEntity } from '@entities/base.entity';
import { Column, Entity, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('waitlist')
export class Waitlist extends AbstractBaseEntity {
  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  name?: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}
