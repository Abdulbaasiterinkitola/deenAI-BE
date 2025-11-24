import { AbstractBaseEntity } from '@entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '@modules/users/models/user.model';

/**
 * Entity representing the usage of AI tokens by a user.
 * This table tracks how many tokens are consumed for different features (e.g., chat, title generation)
 * and models (e.g., gemini-2.0-flash-001).
 * It links to the User entity to allow aggregation of usage per user.
 */
@Entity({ name: 'token_usage' })
export class TokenUsage extends AbstractBaseEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId: string;

  // Relationship to the User entity. If the user is deleted, their token usage records are also deleted (CASCADE).
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'input_tokens', type: 'int', default: 0 })
  inputTokens: number; // Number of tokens in the prompt/input

  @Column({ name: 'output_tokens', type: 'int', default: 0 })
  outputTokens: number; // Number of tokens in the response/output

  @Column({ name: 'total_tokens', type: 'int', default: 0 })
  totalTokens: number; // Sum of input and output tokens
}
