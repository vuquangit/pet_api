import { MessageAttachment } from './entities/MessageAttachment';
import { GroupMessageAttachment } from '@/modules/groups/entities/GroupMessageAttachment';
import { Attachment } from './interfaces/attachment.interface';

export interface IMessageAttachmentsService {
  create(attachments: Attachment[]): Promise<MessageAttachment[]>;
  createGroupAttachments(
    attachments: Attachment[],
  ): Promise<GroupMessageAttachment[]>;
  deleteAllAttachments(attachments: MessageAttachment[]): any;
}
