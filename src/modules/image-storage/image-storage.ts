import { MessageAttachment } from '@/modules/message-attachments/entities/MessageAttachment';
import { GroupMessageAttachment } from '@/modules/groups/entities/GroupMessageAttachment';
import {
  UploadGroupMessageAttachmentParams,
  UploadImageParams,
  UploadMessageAttachmentParams,
} from '@/utils/types';

export interface IImageStorageService {
  upload(params: UploadImageParams): any;
  uploadMessageAttachment(
    params: UploadMessageAttachmentParams,
  ): Promise<MessageAttachment>;
  uploadGroupMessageAttachment(
    params: UploadGroupMessageAttachmentParams,
  ): Promise<GroupMessageAttachment>;
}
