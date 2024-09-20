import {
  Controller,
  Param,
  // ParseIntPipe,
  Post,
  Body,
  Inject,
  Delete,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SkipThrottle } from '@nestjs/throttler';

import { Routes, Services } from '@/constants/constants';
import { AuthUser } from '@/utils/decorators';
// import { User } from '../../utils/typeorm';
import { AddGroupRecipientDto } from '../dtos/AddGroupRecipient.dto';
import { IGroupRecipientService } from '../interfaces/group-recipient';
import { User } from '@/modules/users/entity/user.entity';

@SkipThrottle()
@Controller(Routes.GROUP_RECIPIENTS)
export class GroupRecipientsController {
  constructor(
    @Inject(Services.GROUP_RECIPIENTS)
    private readonly groupRecipientService: IGroupRecipientService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async addGroupRecipient(
    @AuthUser() user: User,
    @Param('id') id: string,
    @Body() { add_user_id }: AddGroupRecipientDto,
  ) {
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
  async leaveGroup(@AuthUser() user: User, @Param('id') groupId: string) {
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
    @AuthUser() user: User,
    @Param('id') id: string,
    @Param('userId') removeUserId: string,
  ) {
    const userId = user._id.toString();
    const params = { issuerId: userId, id, removeUserId };
    const response =
      await this.groupRecipientService.removeGroupRecipient(params);
    this.eventEmitter.emit('group.user.remove', response);
    return response.group;
  }
}
