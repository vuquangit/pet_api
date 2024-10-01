import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IImageStorageService } from '../image-storage/image-storage';
import { Services } from '@/constants/constants';
import { IMessageAttachmentsService } from './message-attachments';
import { MessageAttachment } from './entities/MessageAttachment';
import { GroupMessageAttachment } from '@/modules/groups/entities/GroupMessageAttachment';
import { Attachment } from './interfaces/attachment.interface';

@Injectable()
export class MessageAttachmentsService implements IMessageAttachmentsService {
  constructor(
    @InjectRepository(MessageAttachment)
    private readonly attachmentRepository: Repository<MessageAttachment>,
    @InjectRepository(GroupMessageAttachment)
    private readonly groupAttachmentRepository: Repository<GroupMessageAttachment>,
    @Inject(Services.IMAGE_UPLOAD_SERVICE)
    private readonly imageUploadService: IImageStorageService,
  ) {}
  create(attachments: Attachment[]) {
    const promise = attachments.map((attachment) => {
      const newAttachment = this.attachmentRepository.create();
      return this.attachmentRepository
        .save(newAttachment)
        .then((messageAttachment) =>
          this.imageUploadService.uploadMessageAttachment({
            messageAttachment,
            file: attachment,
          }),
        );
    });
    return Promise.all(promise);
  }

  createGroupAttachments(
    attachments: Attachment[],
  ): Promise<GroupMessageAttachment[]> {
    const promise = attachments.map((attachment) => {
      const newAttachment = this.groupAttachmentRepository.create();
      return this.groupAttachmentRepository
        .save(newAttachment)
        .then((messageAttachment) =>
          this.imageUploadService.uploadGroupMessageAttachment({
            messageAttachment,
            file: attachment,
          }),
        );
    });
    return Promise.all(promise);
  }

  deleteAllAttachments(attachments: MessageAttachment[]) {
    const promise = attachments.map((attachment) =>
      this.attachmentRepository.delete(attachment.key),
    );
    return Promise.all(promise);
  }
}
