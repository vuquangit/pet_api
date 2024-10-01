import { User } from '@/modules/users/entities/user.entity';
import { GroupMessage } from '../entities/GroupMessage';
import { EditGroupMessageParams } from '@/modules/messages/interfaces/message.interface';
import { Group } from '../entities/Group';

export interface IGroupMessageService {
  createGroupMessage(params: CreateGroupMessageParams): any;
  getGroupMessages(id: string): Promise<GroupMessage[]>;
  deleteGroupMessage(params: DeleteGroupMessageParams): any;
  editGroupMessage(params: EditGroupMessageParams): Promise<GroupMessage>;
}

export interface CreateGroupMessageParams {
  author: User;
  // attachments?: Attachment[];
  content: string;
  groupId: string;
}

export interface CreateGroupMessageResponse {
  message: GroupMessage;
  group: Group;
}

export interface DeleteGroupMessageParams {
  userId: string;
  groupId: string;
  messageId: string;
}
