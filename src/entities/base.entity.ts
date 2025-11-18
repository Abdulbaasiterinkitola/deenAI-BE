import {
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { randomUUID } from 'crypto';

@Entity()
export class AbstractBaseEntity {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }
}
