// import { Group, User } from '../../utils/typeorm';
import {
  AccessParams,
  CreateGroupParams,
  FetchGroupsParams,
  TransferOwnerParams,
  UpdateGroupDetailsParams,
} from '@/utils/types';
import { Group } from '../entities/Group';
import { User } from '@/modules/users/entity/user.entity';

export interface IGroupService {
  createGroup(params: CreateGroupParams): any;
  getGroups(params: FetchGroupsParams): Promise<Group[]>;
  findGroupById(id: string): Promise<Group>;
  saveGroup(group: Group): Promise<Group>;
  hasAccess(params: AccessParams): Promise<User | undefined>;
  transferGroupOwner(params: TransferOwnerParams): Promise<Group>;
  updateDetails(params: UpdateGroupDetailsParams): Promise<Group>;
}
