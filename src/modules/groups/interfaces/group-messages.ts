import { GroupMessage } from '@/utils/typeorm';
import {
  CreateGroupMessageParams,
  DeleteGroupMessageParams,
  EditGroupMessageParams,
} from '@/utils/types';

export interface IGroupMessageService {
  createGroupMessage(params: CreateGroupMessageParams): any;
  getGroupMessages(id: string): Promise<GroupMessage[]>;
  deleteGroupMessage(params: DeleteGroupMessageParams): any;
  editGroupMessage(params: EditGroupMessageParams): Promise<GroupMessage>;
}
