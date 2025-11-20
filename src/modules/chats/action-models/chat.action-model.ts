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
}
