import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Patch,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

import { CreateMessageDto } from '@/modules/messages/dtos/CreateMessage.dto';
import { EditMessageDto } from '@/modules/messages/dtos/EditMessage.dto';
import { EmptyMessageException } from '@/modules/messages/exceptions/EmptyMessage';
import { Routes, Services } from '@/constants/constants';
import { AuthUser } from '@/utils/decorators';
import { Attachment } from '@/utils/types';
import { IGroupMessageService } from '../interfaces/group-messages';
import { User } from '@/modules/users/entities/user.entity';

@Controller(Routes.GROUP_MESSAGES)
export class GroupMessageController {
  constructor(
    @Inject(Services.GROUP_MESSAGES)
    private readonly groupMessageService: IGroupMessageService,
    private readonly eventEmitter: EventEmitter2,
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
  async createGroupMessage(
    @AuthUser() user: User,
    @UploadedFiles() { attachments }: { attachments: Attachment[] },
    @Param('id') id: string,
    @Body() { content }: CreateMessageDto,
  ) {
    console.log(`Creating Group Message for ${id}`);
    if (!attachments && !content) throw new EmptyMessageException();
    const params = { groupId: id, author: user, content, attachments };
    const response = await this.groupMessageService.createGroupMessage(params);
    this.eventEmitter.emit('group.message.create', response);
    return;
  }

  @Get()
  @SkipThrottle()
  async getGroupMessages(@AuthUser() user: User, @Param('id') id: string) {
    console.log(`Fetching GroupMessages for Group Id: ${id}`);
    const messages = await this.groupMessageService.getGroupMessages(id);
    return { id, messages };
  }

  @Delete(':messageId')
  @SkipThrottle()
  async deleteGroupMessage(
    @AuthUser() user: User,
    @Param('id') groupId: string,
    @Param('messageId') messageId: string,
  ) {
    const userId = user._id.toString();
    await this.groupMessageService.deleteGroupMessage({
      userId,
      groupId,
      messageId,
    });
    this.eventEmitter.emit('group.message.delete', {
      userId,
      messageId,
      groupId,
    });
    return { groupId, messageId };
  }

  @Patch(':messageId')
  @SkipThrottle()
  async editGroupMessage(
    @AuthUser() user: User,
    @Param('id') groupId: string,
    @Param('messageId') messageId: string,
    @Body() { content }: EditMessageDto,
  ) {
    const userId = user._id.toString();
    const params = { userId, content, groupId, messageId };
    const message = await this.groupMessageService.editGroupMessage(params);
    this.eventEmitter.emit('group.message.update', message);
    return message;
  }
}
