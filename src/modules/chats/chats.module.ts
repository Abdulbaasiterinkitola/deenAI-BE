import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './models/chat.model';
import { ChatMessage } from './models/chat-message.model';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { ChatsCoreService } from './services/chats-core.service';
import { ChatsValidationService } from './services/chats-validation.service';
import { GeminiService } from './services/gemini.service';
import { ChatActionModel } from './action-models/chat.action-model';
import { ChatMessageActionModel } from './action-models/chat-message.action-model';
import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';
import { TokenUsageModule } from '@modules/token-usage/token-usage.module';
import { ChatRetentionService } from './services/chat-retention.service';
import { ChatCleanupService } from './services/chat-cleanup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ChatMessage]),
    UsersModule,
    AuthModule,
    TokenUsageModule, // Import TokenUsageModule to enable token tracking in ChatsService
  ],
  controllers: [ChatsController],
  providers: [
    ChatsService,
    ChatsCoreService,
    ChatsValidationService,
    GeminiService,
    ChatActionModel,
    ChatMessageActionModel,
    ChatRetentionService,
    ChatCleanupService,
  ],
  exports: [ChatsService],
})
export class ChatsModule {}
