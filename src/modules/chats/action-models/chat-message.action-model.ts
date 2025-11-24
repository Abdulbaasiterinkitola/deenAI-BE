import { Injectable } from '@nestjs/common';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { ChatMessage } from '../models/chat-message.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ChatMessageActionModel extends AbstractModelAction<ChatMessage> {
  constructor(
    @InjectRepository(ChatMessage)
    repository: Repository<ChatMessage>,
  ) {
    super(repository, ChatMessage);
  }
  async customQuery(query: string, parameters?: any[]): Promise<any> {
    return this.repository.query(query, parameters);
  }
}
