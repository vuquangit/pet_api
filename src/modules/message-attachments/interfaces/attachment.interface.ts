import { GroupMessageAttachment } from '@/modules/groups/entities/GroupMessageAttachment';
import { MessageAttachment } from '@/modules/message-attachments/entities/MessageAttachment';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Attachment extends Express.Multer.File {}

export type UploadMessageAttachmentParams = {
  file: Attachment;
  messageAttachment: MessageAttachment;
};

export type UploadGroupMessageAttachmentParams = {
  file: Attachment;
  messageAttachment: GroupMessageAttachment;
};
