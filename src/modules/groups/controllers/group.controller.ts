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
  Request,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileInterceptor } from '@nestjs/platform-express';
import { SkipThrottle } from '@nestjs/throttler';

import { Routes, Services } from '@/constants/constants';
import { CreateGroupDto } from '../dtos/CreateGroup.dto';
import { TransferOwnerDto } from '../dtos/TransferOwner.dto';
import { UpdateGroupDetailsDto } from '../dtos/UpdateGroupDetails.dto';
import { IGroupService } from '../interfaces/group';
import { User } from '@/modules/users/entities/user.entity';
import { AccessTokenGuard } from '@/modules/auth/guards/accessToken-auth.guard';
import { Attachment } from '@/modules/message-attachments/interfaces/attachment.interface';

@SkipThrottle()
@Controller(Routes.GROUPS)
@UseGuards(AccessTokenGuard)
export class GroupController {
  constructor(
    @Inject(Services.GROUPS) private readonly groupService: IGroupService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async createGroup(
    @Request() req: { user: User },
    @Body() payload: CreateGroupDto,
  ) {
    const user = req.user;
    const group = await this.groupService.createGroup({
      ...payload,
      creator: user,
    });
    this.eventEmitter.emit('group.create', group);
    return group;
  }

  @Get()
  getGroups(@Request() req: { user: User }) {
    const user = req.user;
    const userId = user._id.toString();
    return this.groupService.getGroups({ userId });
  }

  @Get(':id')
  getGroup(@Param('id') id: string) {
    return this.groupService.findGroupById(id);
  }

  @Patch(':id/owner')
  async updateGroupOwner(
    @Request() req: { user: User },
    @Param('id') groupId: string,
    @Body() { new_owner_id }: TransferOwnerDto,
  ) {
    const user = req.user;
    const userId = user._id.toString();
    const params = { userId, groupId, new_owner_id };
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
    return this.groupService.updateDetails({ id, avatar, title });
  }
}
