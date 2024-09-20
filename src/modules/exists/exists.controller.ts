import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { IConversationsService } from '@/modules/conversations/conversations';
// import { ConversationNotFoundException } from '@/modules/conversations/exceptions/ConversationNotFound';
import { Routes, Services } from '@/constants/constants';
import { AuthUser } from '@/utils/decorators';
import { UsersService } from '@/modules/users/users.service';
import { User } from '@/modules/users/entity/user.entity';

@Controller(Routes.EXISTS)
export class ExistsController {
  constructor(
    @Inject(Services.CONVERSATIONS)
    private readonly conversationsService: IConversationsService,
    private readonly userService: UsersService,
    private readonly events: EventEmitter2,
  ) {}

  @Get('conversations/:recipientId')
  async checkConversationExists(
    @AuthUser() user: User,
    @Param('recipientId') recipientId: string,
  ) {
    const conversation = await this.conversationsService.isCreated(
      recipientId,
      user._id.toString(),
    );
    if (conversation) return conversation;
    const recipient = await this.userService.findById(recipientId);
    if (!recipient)
      throw new HttpException('Recipient Not Found', HttpStatus.NOT_FOUND);
    const newConversation = await this.conversationsService.createConversation(
      user,
      {
        // username: recipient.name,
        user_id: recipient._id.toString(),
        message: 'hello',
      },
    );
    this.events.emit('conversation.create', newConversation);
    return newConversation;
  }
}
