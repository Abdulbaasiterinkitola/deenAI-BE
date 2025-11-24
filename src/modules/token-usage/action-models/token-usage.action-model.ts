import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { TokenUsage } from '../models/token-usage.entity';

/**
 * Action Model for TokenUsage.
 * Extends the AbstractModelAction to provide standard CRUD operations for the TokenUsage entity.
 * This abstraction layer separates the database repository logic from the business service layer.
 */
@Injectable()
export class TokenUsageActionModel extends AbstractModelAction<TokenUsage> {
  constructor(
    @InjectRepository(TokenUsage)
    private readonly tokenUsageRepository: Repository<TokenUsage>,
  ) {
    super(tokenUsageRepository, TokenUsage);
  }
}
