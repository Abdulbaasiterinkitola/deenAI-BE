import { Injectable } from '@nestjs/common';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { Chat } from '../models/chat.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ChatActionModel extends AbstractModelAction<Chat> {
  constructor(@InjectRepository(Chat) repository: Repository<Chat>) {
    super(repository, Chat);
  }
  async deleteUserChat(options: {
    id: string;
    userId: string;
  }): Promise<boolean> {
    const result = await this.repository.delete({
      id: options.id,
      userId: options.userId,
    });

    return (result.affected ?? 0) > 0;
  }
}
