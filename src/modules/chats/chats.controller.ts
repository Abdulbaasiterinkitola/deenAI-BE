import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Sse,
  Request,
  Query,
  Patch,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChatsService } from './chats.service';
import { SendMessageDto, ChatIdDto } from './dtos/chat.dto';
import { AuthGuard } from '@guards/auth.guard';
import { SseMessage } from './types';
import { ChatsDocs } from './docs/chats.doc';
import { GetMessagesQueryDto } from './dtos/get-message.dto';
import { RenameChatDto } from './dtos/rename-chat.dto';

@ApiTags('Chats')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('chats')
export class ChatsController {
  private readonly logger = new Logger(ChatsController.name);
  constructor(private readonly chatsService: ChatsService) {}

  /**
   * GET endpoint to retrieve all chats for the authenticated user
   * Requires authentication
   */
  @Get()
  @ChatsDocs.getUserChats()
  async getUserChats(@Request() req: any) {
    const userId = req.user?.id as string;
    return await this.chatsService.getUserChats(userId);
  }

  /**
   * POST endpoint to create a new chat
   * Requires authentication
   */
  @Post()
  @ChatsDocs.createChat()
  async createChat(@Request() req: any) {
    const userId = req.user?.id as string;
    return await this.chatsService.createChat(userId);
  }

  /**
   * POST endpoint to send a message in a chat and get AI response
   * Requires authentication and chat ownership
   */
  @Post(':id')
  @ChatsDocs.sendMessage()
  async sendMessage(
    @Param() params: ChatIdDto,
    @Body() sendMessageDto: SendMessageDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id as string;
    return await this.chatsService.sendMessage(
      params.id,
      userId,
      sendMessageDto.message,
    );
  }

  /**
   * GET endpoint to stream AI response for a chat
   * Requires authentication and chat ownership
   */
  @Sse(':id/stream')
  @ChatsDocs.sendMessage() // You might want to create a new doc for this
  streamMessage(
    @Param() params: ChatIdDto,
    @Request() req: any,
  ): Observable<SseMessage> {
    const userId = req.user?.id as string;
    return this.chatsService.streamResponse(params.id, userId);
  }
  @Get(':id/messages')
  @ChatsDocs.getMessages()
  async getChatMessages(
    @Param() params: ChatIdDto,
    @Query() query: GetMessagesQueryDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id as string;

    const page: number = query.page ?? 1;
    const limit: number = query.limit ?? 50;
    return await this.chatsService.getChatMessages(
      params.id,
      userId,
      page,
      limit,
    );
  }

  /**
   * DELETE endpoint to remove a chat
   * Requires authentication and chat ownership
   */
  @Delete(':id')
  @ChatsDocs.deleteChat()
  async deleteChat(@Param() params: ChatIdDto, @Request() req: any) {
    const userId = req.user?.id as string;
    return await this.chatsService.deleteChat(params.id, userId);
  }

  /**
   * Renames a specific chat
   * Requires authentication and chat ownership
   * @param params - ChatIdDto containing the ID of the chat
   * @param renameChatDto - DTO containing the new title
   */
  @Patch(':id/rename')
  @ChatsDocs.renameChat()
  async renameChat(
    @Param() params: ChatIdDto,
    @Body() renameChatDto: RenameChatDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id as string;
    return await this.chatsService.renameChat(params.id, userId, renameChatDto);
  }
}
