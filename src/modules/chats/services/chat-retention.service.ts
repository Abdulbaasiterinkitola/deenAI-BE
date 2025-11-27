import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ChatMessageActionModel } from '../action-models/chat-message.action-model';

@Injectable()
export class ChatRetentionService {
  constructor(
    private readonly chatMessageActionModel: ChatMessageActionModel,
  ) {}

  // Runs every day at midnight
  @Cron('0 0 * * *')
  async deleteOldMessages() {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    await this.chatMessageActionModel.customQuery(
      `
      DELETE FROM chat_messages
      WHERE created_at < $1
      `,
      [ninetyDaysAgo],
    );
  }
}
