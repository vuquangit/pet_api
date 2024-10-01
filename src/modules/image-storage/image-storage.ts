import { MessageAttachment } from '@/modules/message-attachments/entities/MessageAttachment';
import { GroupMessageAttachment } from '@/modules/groups/entities/GroupMessageAttachment';
import {
  UploadMessageAttachmentParams,
  UploadGroupMessageAttachmentParams,
} from '../message-attachments/interfaces/attachment.interface';
import { UploadImageParams } from './interfaces/storage.interface';

export interface IImageStorageService {
  upload(params: UploadImageParams): any;
  uploadMessageAttachment(
    params: UploadMessageAttachmentParams,
  ): Promise<MessageAttachment>;
  uploadGroupMessageAttachment(
    params: UploadGroupMessageAttachmentParams,
  ): Promise<GroupMessageAttachment>;
}
