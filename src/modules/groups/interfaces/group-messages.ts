import {
  CreateGroupMessageParams,
  DeleteGroupMessageParams,
  EditGroupMessageParams,
} from '@/utils/types';
import { GroupMessage } from '../entities/GroupMessage';

export interface IGroupMessageService {
  createGroupMessage(params: CreateGroupMessageParams): any;
  getGroupMessages(id: string): Promise<GroupMessage[]>;
  deleteGroupMessage(params: DeleteGroupMessageParams): any;
  editGroupMessage(params: EditGroupMessageParams): Promise<GroupMessage>;
}
