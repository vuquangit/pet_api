import { Group } from '../entities/Group';
import { User } from '@/modules/users/entities/user.entity';
import { Attachment } from '@/modules/message-attachments/interfaces/attachment.interface';
import { Request } from 'express';

export interface IGroupService {
  createGroup(params: CreateGroupParams): any;
  getGroups(params: FetchGroupsParams): Promise<Group[]>;
  findGroupById(id: string): Promise<Group>;
  saveGroup(group: Group): Promise<Group>;
  hasAccess(params: AccessParams): Promise<User | undefined>;
  transferGroupOwner(params: TransferOwnerParams): Promise<Group>;
  updateDetails(params: UpdateGroupDetailsParams): Promise<Group>;
}

export interface CreateGroupParams {
  creator: User;
  title?: string;
  users: string[];
}

export interface FetchGroupsParams {
  userId: string;
}

export interface TransferOwnerParams {
  userId: string;
  groupId: string;
  new_owner_id: string;
}

export interface UpdateGroupDetailsParams {
  id: string;
  title?: string;
  avatar?: Attachment;
}

export interface AccessParams {
  id: string;
  userId: string;
}

export interface AuthenticatedRequest extends Request {
  user: User;
}
