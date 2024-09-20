import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileInterceptor } from '@nestjs/platform-express';
import { SkipThrottle } from '@nestjs/throttler';

import { Routes, Services } from '@/constants/constants';
import { AuthUser } from '@/utils/decorators';
// import { User } from '../../utils/typeorm';
import { Attachment } from '@/utils/types';
import { CreateGroupDto } from '../dtos/CreateGroup.dto';
import { TransferOwnerDto } from '../dtos/TransferOwner.dto';
import { UpdateGroupDetailsDto } from '../dtos/UpdateGroupDetails.dto';
import { IGroupService } from '../interfaces/group';
import { User } from '@/modules/users/entity/user.entity';

@SkipThrottle()
@Controller(Routes.GROUPS)
export class GroupController {
  constructor(
    @Inject(Services.GROUPS) private readonly groupService: IGroupService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async createGroup(@AuthUser() user: User, @Body() payload: CreateGroupDto) {
    const group = await this.groupService.createGroup({
      ...payload,
      creator: user,
    });
    this.eventEmitter.emit('group.create', group);
    return group;
  }

  @Get()
  getGroups(@AuthUser() user: User) {
    return this.groupService.getGroups({ userId: user._id.toString() });
  }

  @Get(':id')
  getGroup(@AuthUser() user: User, @Param('id') id: string) {
    return this.groupService.findGroupById(id);
  }

  @Patch(':id/owner')
  async updateGroupOwner(
    @AuthUser() user: User,
    @Param('id') groupId: string,
    @Body() { newOwnerId }: TransferOwnerDto,
  ) {
    const userId = user._id.toString();
    const params = { userId, groupId, newOwnerId };
    const group = await this.groupService.transferGroupOwner(params);
    this.eventEmitter.emit('group.owner.update', group);
    return group;
  }

  @Patch(':id/details')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateGroupDetails(
    @Body() { title }: UpdateGroupDetailsDto,
    @Param('id') id: string,
    @UploadedFile() avatar: Attachment,
  ) {
    console.log(avatar);
    console.log(title);
    return this.groupService.updateDetails({ id, avatar, title });
  }
}
