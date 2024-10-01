import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ImageStorageModule } from '../image-storage/image-storage.module';
import { Services } from '@/constants/constants';
import { MessageAttachment } from './entities/MessageAttachment';
import { GroupMessageAttachment } from '@/modules/groups/entities/GroupMessageAttachment';
import { MessageAttachmentsService } from './message-attachments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageAttachment, GroupMessageAttachment]),
    ImageStorageModule,
  ],
  providers: [
    {
      provide: Services.MESSAGE_ATTACHMENTS,
      useClass: MessageAttachmentsService,
    },
  ],
  exports: [
    {
      provide: Services.MESSAGE_ATTACHMENTS,
      useClass: MessageAttachmentsService,
    },
  ],
})
export class MessageAttachmentsModule {}
