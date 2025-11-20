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

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ChatMessage]),
    UsersModule,
    AuthModule,
  ],
  controllers: [ChatsController],
  providers: [
    ChatsService,
    ChatsCoreService,
    ChatsValidationService,
    GeminiService,
    ChatActionModel,
    ChatMessageActionModel,
  ],
  exports: [ChatsService],
})
export class ChatsModule {}
