import { MessageAttachment } from '@/modules/message-attachments/entities/MessageAttachment';
import { GroupMessageAttachment } from '@/modules/groups/entities/GroupMessageAttachment';
import {
  UploadMessageAttachmentParams,
  UploadGroupMessageAttachmentParams,
} from '../message-attachments/interfaces/attachment.interface';
import {
  CloudinaryResponse,
  UploadImageParams,
} from './interfaces/storage.interface';

export interface IImageStorageService {
  upload(params: UploadImageParams): Promise<CloudinaryResponse>;
  delete(id: string): Promise<any>;
  deletes(ids: string[]): Promise<any>;
  uploadMessageAttachment(
    params: UploadMessageAttachmentParams,
  ): Promise<MessageAttachment>;
  uploadGroupMessageAttachment(
    params: UploadGroupMessageAttachmentParams,
  ): Promise<GroupMessageAttachment>;
}
