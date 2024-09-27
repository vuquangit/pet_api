import { Group } from '../entities/Group';
import { User } from '@/modules/users/entities/user.entity';

export interface IGroupRecipientService {
  addGroupRecipient(
    params: AddGroupRecipientParams,
  ): Promise<AddGroupUserResponse>;
  removeGroupRecipient(
    params: RemoveGroupRecipientParams,
  ): Promise<RemoveGroupUserResponse>;
  leaveGroup(params: LeaveGroupParams): any;
  isUserInGroup(params: CheckUserGroupParams): Promise<Group>;
}

export interface AddGroupRecipientParams {
  id: string;
  // username: string;
  add_user_id: string;
  userId: string;
}

export interface RemoveGroupRecipientParams {
  groupId: string;
  removeUserId: string;
  userId: string;
}

export interface AddGroupUserResponse {
  group: Group;
  user: User;
}

export interface RemoveGroupUserResponse {
  group: Group;
  user: User;
}

export interface LeaveGroupParams {
  id: string;
  userId: string;
}

export interface CheckUserGroupParams {
  id: string;
  userId: string;
}
