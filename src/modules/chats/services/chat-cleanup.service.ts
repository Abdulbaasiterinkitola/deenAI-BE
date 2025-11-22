import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ChatMessageActionModel } from '../action-models/chat-message.action-model';

@Injectable()
export class ChatCleanupService {
  constructor(
    private readonly ChatMessageActionModel: ChatMessageActionModel,
  ) {}

  // Runs daily at midnight
  @Cron('0 0 * * *')
  async deleteOrphanChats() {
    await this.ChatMessageActionModel.customQuery(`
      DELETE FROM chats
      WHERE id NOT IN (
        SELECT DISTINCT chat_id FROM chat_messages
      )
    `);
  }
}