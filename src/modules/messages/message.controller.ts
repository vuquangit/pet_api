import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  // UploadedFiles,
  UseInterceptors,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Routes, Services } from '@/constants/constants';
// import { AuthUser } from '@/utils/decorators';
import { CreateMessageDto } from './dtos/CreateMessage.dto';
import { IMessageService } from './message';
import { EditMessageDto } from './dtos/EditMessage.dto';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
// import { EmptyMessageException } from './exceptions/EmptyMessage';
// import { Attachment } from '@/utils/types';
import { User } from '../users/entity/user.entity';
import { AccessTokenGuard } from '@/modules/auth/guards/accessToken-auth.guard';

@Controller(Routes.MESSAGES)
@UseGuards(AccessTokenGuard)
export class MessageController {
  constructor(
    @Inject(Services.MESSAGES) private readonly messageService: IMessageService,
    private eventEmitter: EventEmitter2,
  ) {}

  // @Throttle(5, 10)
  @Throttle({ default: { limit: 5, ttl: 10 } })
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'attachments',
        maxCount: 5,
      },
    ]),
  )
  @Post()
  async createMessage(
    @Request() req: { user: User },
    // @UploadedFiles() { attachments }: { attachments: Attachment[] },
    @Param('id') id: string,
    @Body() body: CreateMessageDto,
  ) {
    const user = req.user;
    // if (!attachments && !content) throw new EmptyMessageException();
    const params = {
      user_id: user._id.toString(),
      id,
      content: body?.content || '',
      // attachments
    };
    const response = await this.messageService.createMessage(params);
    this.eventEmitter.emit('message.create', response);
    return;
  }

  @Get()
  @SkipThrottle()
  async getMessagesFromConversation(
    // @Request() req: { user: User },
    @Param('id') id: string,
  ) {
    const messages = await this.messageService.getMessages(id);
    return { id, messages };
  }

  @Delete(':messageId')
  async deleteMessageFromConversation(
    @Request() req: { user: User },
    @Param('id') conversationId: string,
    @Param('messageId') messageId: string,
  ) {
    const user = req.user;
    const params = { userId: user._id.toString(), conversationId, messageId };
    await this.messageService.deleteMessage(params);
    this.eventEmitter.emit('message.delete', params);
    return { conversationId, messageId };
  }

  // api/conversations/:conversationId/messages/:messageId
  @Patch(':messageId')
  async editMessage(
    // @AuthUser() { id: userId }: User,
    @Request() req: { user: User },
    @Param('id') conversationId: string,
    @Param('messageId') messageId: string,
    @Body() { content }: EditMessageDto,
  ) {
    const user = req.user;
    const userId = user._id.toString();

    const params = { userId, content, conversationId, messageId };
    const message = await this.messageService.editMessage(params);
    this.eventEmitter.emit('message.update', message);
    return message;
  }
}
