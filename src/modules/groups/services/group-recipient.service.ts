import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';

import { Services } from '@/constants/constants';
import { GroupNotFoundException } from '../exceptions/GroupNotFound';
import { GroupParticipantNotFound } from '../exceptions/GroupParticipantNotFound';
import { NotGroupOwnerException } from '../exceptions/NotGroupOwner';
import { IGroupService } from '../interfaces/group';
import {
  AddGroupRecipientParams,
  CheckUserGroupParams,
  IGroupRecipientService,
  LeaveGroupParams,
  RemoveGroupRecipientParams,
} from '../interfaces/group-recipient';
import { UsersService } from '@/modules/users/services/users.service';
import { EXCEPTION_CODE } from '@/constants/exceptionCode';

@Injectable()
export class GroupRecipientService implements IGroupRecipientService {
  constructor(
    private userService: UsersService,
    @Inject(Services.GROUPS) private groupService: IGroupService,
  ) {}

  async addGroupRecipient(params: AddGroupRecipientParams) {
    const group = await this.groupService.findGroupById(params.id);
    if (!group) throw new GroupNotFoundException();
    if (group.owner_id !== params.userId)
      throw new HttpException(
        {
          code: EXCEPTION_CODE.GROUP.INSUFFICIENT_PERMISSIONS,
          message: 'Insufficient Permissions',
        },
        HttpStatus.FORBIDDEN,
      );
    const recipient = await this.userService.findById(params.add_user_id);
    if (!recipient)
      throw new HttpException(
        {
          code: EXCEPTION_CODE.USER.ID_NOT_FOUND,
          message: 'User Not Found, cannot add user',
        },
        HttpStatus.BAD_REQUEST,
      );

    const inGroup = group.users.find(
      (user) => user._id.toString() === recipient._id.toString(),
    );
    if (inGroup)
      throw new HttpException(
        {
          code: EXCEPTION_CODE.GROUP.ALREADY_EXISTS,
          message: 'User already in group',
        },
        HttpStatus.BAD_REQUEST,
      );

    group.user_ids = [...group.user_ids, recipient._id.toString()];
    const savedGroup = await this.groupService.saveGroup(group);
    return { group: savedGroup, user: recipient };
  }

  /**
   * Removes a Group Recipient as a Group Owner.
   * Does not allow users to leave the group.
   * @param params RemoveGroupRecipientParams
   * @returns Promise<Group>
   */
  async removeGroupRecipient(params: RemoveGroupRecipientParams) {
    const { userId, removeUserId, groupId } = params;
    const userToBeRemoved = await this.userService.findById(removeUserId);
    if (!userToBeRemoved)
      throw new HttpException(
        {
          code: EXCEPTION_CODE.USER.ID_NOT_FOUND,
          message: 'User Not Found, cannot remove user',
        },
        HttpStatus.BAD_REQUEST,
      );

    const group = await this.groupService.findGroupById(groupId);
    if (!group) throw new GroupNotFoundException();
    // Not group owner
    if (group.owner_id !== userId) throw new NotGroupOwnerException();

    // Temporary
    if (group.owner_id === removeUserId)
      throw new HttpException(
        {
          code: EXCEPTION_CODE.GROUP.INSUFFICIENT_PERMISSIONS,
          message: 'Cannot remove yourself as owner',
        },
        HttpStatus.BAD_REQUEST,
      );

    // is not exist
    if (!group.user_ids.includes(removeUserId))
      throw new HttpException(
        {
          code: EXCEPTION_CODE.GROUP.NOT_FOUND,
          message: 'User not in group',
        },
        HttpStatus.BAD_REQUEST,
      );

    group.user_ids = group.user_ids.filter((userId) => userId !== removeUserId);
    const savedGroup = await this.groupService.saveGroup(group);
    return { group: savedGroup, user: userToBeRemoved };
  }

  async isUserInGroup({ id, userId }: CheckUserGroupParams) {
    const group = await this.groupService.findGroupById(id);
    if (!group) throw new GroupNotFoundException();
    const user = group.user_ids.find((_userId) => _userId === userId);
    if (!user) throw new GroupParticipantNotFound();
    return group;
  }

  async leaveGroup({ id, userId }: LeaveGroupParams) {
    const group = await this.isUserInGroup({ id, userId });
    console.log(`Updating Groups`);
    if (group.owner_id === userId)
      throw new HttpException(
        {
          code: EXCEPTION_CODE.GROUP.INSUFFICIENT_PERMISSIONS,
          message: 'Cannot leave group as owner',
        },
        HttpStatus.BAD_REQUEST,
      );
    console.log('New Users in Group after leaving...');
    console.log(group.user_ids.filter((_userId) => _userId !== userId));
    group.user_ids = group.user_ids.filter((_userId) => _userId !== userId);
    return this.groupService.saveGroup(group);
  }
}
