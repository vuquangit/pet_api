import {
  Controller,
  Param,
  Post,
  Body,
  Inject,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SkipThrottle } from '@nestjs/throttler';

import { Routes, Services } from '@/constants/constants';
import { AddGroupRecipientDto } from '../dtos/AddGroupRecipient.dto';
import { IGroupRecipientService } from '../interfaces/group-recipient';
import { User } from '@/modules/users/entities/user.entity';
import { AccessTokenGuard } from '@/modules/auth/guards/accessToken-auth.guard';

@SkipThrottle()
@Controller(Routes.GROUP_RECIPIENTS)
@UseGuards(AccessTokenGuard)
export class GroupRecipientsController {
  constructor(
    @Inject(Services.GROUP_RECIPIENTS)
    private readonly groupRecipientService: IGroupRecipientService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   *
   * @param req Add new user to group
   * @param id the id of the group
   * @param add_user_id the id of the new user
   * @returns response
   */
  @Post()
  async addGroupRecipient(
    @Request() req: { user: User },
    @Param('id') id: string,
    @Body() { add_user_id }: AddGroupRecipientDto,
  ) {
    const user = req.user;
    const userId = user._id.toString();
    const params = { id, userId, add_user_id };
    const response = await this.groupRecipientService.addGroupRecipient(params);
    this.eventEmitter.emit('group.user.add', response);
    return response;
  }

  /**
   * Leaves a Group
   * @param user the authenticated User
   * @param groupId the id of the group
   * @returns the updated Group that the user had left
   */
  @Delete('leave')
  async leaveGroup(
    @Request() req: { user: User },
    @Param('id') groupId: string,
  ) {
    const user = req.user;
    const userId = user._id.toString();
    const group = await this.groupRecipientService.leaveGroup({
      id: groupId,
      userId,
    });
    this.eventEmitter.emit('group.user.leave', { group, userId });
    return group;
  }

  @Delete(':userId')
  async removeGroupRecipient(
    @Request() req: { user: User },
    @Param('id') groupId: string,
    @Param('userId') removeUserId: string,
  ) {
    const user = req.user;
    const userId = user._id.toString();
    const params = { userId: userId, groupId, removeUserId };
    const response =
      await this.groupRecipientService.removeGroupRecipient(params);
    this.eventEmitter.emit('group.user.remove', response);
    return response.group;
  }
}
