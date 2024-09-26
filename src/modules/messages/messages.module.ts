import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConversationsModule } from '@/modules/conversations/conversations.module';
import { FriendsModule } from '@/modules/friends/friends.module';
import { ImageStorageModule } from '@/modules/image-storage/image-storage.module';
import { MessageAttachmentsModule } from '@/modules/message-attachments/message-attachments.module';
import { Services } from '@/constants/constants';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';
import { Conversation } from '@/modules/conversations/entities/conversation.entity';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Conversation]),
    ImageStorageModule,
    MessageAttachmentsModule,
    ConversationsModule,
    FriendsModule,
    UsersModule,
  ],
  controllers: [MessageController],
  providers: [
    {
      provide: Services.MESSAGES,
      useClass: MessageService,
    },
  ],
})
export class MessagesModule {}
