import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Throttle } from '@nestjs/throttler';

import { Routes, ServerEvents, Services } from '@/constants/constants';
import { CreateFriendDto } from './dtos/CreateFriend.dto';
import { IFriendRequestService } from './friend-requests';
import { User } from '@/modules/users/entities/user.entity';
import { AccessTokenGuard } from '@/modules/auth/guards/accessToken-auth.guard';

@Controller(Routes.FRIEND_REQUESTS)
@UseGuards(AccessTokenGuard)
export class FriendRequestController {
  constructor(
    @Inject(Services.FRIENDS_REQUESTS_SERVICE)
    private readonly friendRequestService: IFriendRequestService,
    private event: EventEmitter2,
  ) {}

  @Get()
  getFriendRequests(@Request() req: { user: User }) {
    const user = req.user;
    const userId = user._id.toString();
    return this.friendRequestService.getFriendRequests(userId);
  }

  // @Throttle(3, 10)
  @Throttle({ default: { limit: 3, ttl: 10 } })
  @Post()
  async createFriendRequest(
    @Request() req: { user: User },
    @Body() { request_id }: CreateFriendDto,
  ) {
    const user = req.user;
    const params = { user, request_id };
    const friendRequest = await this.friendRequestService.create(params);
    this.event.emit(ServerEvents.FRIEND_REQUEST_CREATED, friendRequest);
    return friendRequest;
  }

  // @Throttle(3, 10)
  @Throttle({ default: { limit: 3, ttl: 10 } })
  @Patch(':id/accept')
  async acceptFriendRequest(
    @Request() req: { user: User },
    @Param('id') id: string,
  ) {
    const user = req.user;
    const userId = user._id.toString();
    const response = await this.friendRequestService.accept({ id, userId });
    this.event.emit(ServerEvents.FRIEND_REQUEST_ACCEPTED, response);
    return response;
  }

  // @Throttle(3, 10)
  @Throttle({ default: { limit: 3, ttl: 10 } })
  @Delete(':id/cancel')
  async cancelFriendRequest(
    @Request() req: { user: User },
    @Param('id') id: string,
  ) {
    const user = req.user;
    const userId = user._id.toString();
    const response = await this.friendRequestService.cancel({ id, userId });
    this.event.emit(ServerEvents.FRIEND_REQUEST_CANCELLED, response);
    return response;
  }

  // @Throttle(3, 10)
  @Throttle({ default: { limit: 3, ttl: 10 } })
  @Patch(':id/reject')
  async rejectFriendRequest(
    @Request() req: { user: User },
    @Param('id') id: string,
  ) {
    const user = req.user;
    const userId = user._id.toString();
    const response = await this.friendRequestService.reject({ id, userId });
    this.event.emit(ServerEvents.FRIEND_REQUEST_REJECTED, response);
    return response;
  }
}
