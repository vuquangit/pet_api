import {
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SkipThrottle } from '@nestjs/throttler';

import { Routes, ServerEvents, Services } from '../../constants/constants';
import { User } from '@/modules/users/entity/user.entity';
import { AccessTokenGuard } from '@/modules/auth/guards/accessToken-auth.guard';
import { IFriendsService } from './friends';

@SkipThrottle()
@Controller(Routes.FRIENDS)
@UseGuards(AccessTokenGuard)
export class FriendsController {
  constructor(
    @Inject(Services.FRIENDS_SERVICE)
    private readonly friendsService: IFriendsService,
    private readonly event: EventEmitter2,
  ) {}

  @Get()
  getFriends(@Request() req: { user: User }) {
    const user = req.user;
    const id = user._id.toString();
    return this.friendsService.getFriends(id);
  }

  @Delete(':id/delete')
  async deleteFriend(@Request() req: { user: User }, @Param('id') id: string) {
    const user = req.user;
    const userId = user._id.toString();

    const friend = await this.friendsService.deleteFriend({ id, userId });
    this.event.emit(ServerEvents.FRIEND_REMOVED, { friend, userId });
    return friend;
  }
}
