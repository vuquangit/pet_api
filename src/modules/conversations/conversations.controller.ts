import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SkipThrottle } from '@nestjs/throttler';

import { IConversationsService } from './conversations';
import { CreateConversationDto } from './dtos/CreateConversation.dto';
import { Routes, Services } from '@/constants/constants';
import { AccessTokenGuard } from '@/modules/auth/guards/accessToken-auth.guard';
import { User } from '@/modules/users/entities/user.entity';

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
    @Request() req: { user: User },
    @Body() createConversationPayload: CreateConversationDto,
  ) {
    const user = req.user;
    console.log('createConversation');
    const conversation = await this.conversationsService.createConversation(
      user,
      createConversationPayload,
    );
    this.events.emit('conversation.create', conversation);
    return conversation;
  }

  @Get()
  async getConversations(@Request() req: { user: User }) {
    const user = req.user;
    const id = user._id.toString();
    return this.conversationsService.getConversations(id);
  }

  @Get(':id')
  async getConversationById(@Param('id') id: string) {
    return this.conversationsService.findById(id);
  }
}
