import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SkipThrottle } from '@nestjs/throttler';

import { IConversationsService } from './conversations';
import { CreateConversationDto } from './dtos/CreateConversation.dto';
import { Routes, Services } from '@/constants/constants';
import { AuthUser } from '@/utils/decorators';
import { AccessTokenGuard } from '@/modules/auth/guards/accessToken-auth.guard';
import { User } from '@/modules/users/entity/user.entity';

@SkipThrottle()
@Controller(Routes.CONVERSATIONS)
@UseGuards(AccessTokenGuard)
export class ConversationsController {
  constructor(
    @Inject(Services.CONVERSATIONS)
    private readonly conversationsService: IConversationsService,
    private readonly events: EventEmitter2,
  ) {}
  @Get('test/endpoint/check')
  test() {
    return 'Test success!!!';
  }

  @Post()
  async createConversation(
    @AuthUser() user: User,
    @Body() createConversationPayload: CreateConversationDto,
  ) {
    console.log('createConversation');
    const conversation = await this.conversationsService.createConversation(
      user,
      createConversationPayload,
    );
    this.events.emit('conversation.create', conversation);
    return conversation;
  }

  @Get()
  async getConversations(@AuthUser() user: User) {
    const id = user._id.toString();
    return this.conversationsService.getConversations(id);
  }

  @Get(':id')
  async getConversationById(@Param('id') id: string) {
    return this.conversationsService.findById(id);
  }
}
