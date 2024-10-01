import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FriendsModule } from '@/modules/friends/friends.module';
import { UsersModule } from '@/modules/users/users.module';
import { Services } from '@/constants/constants';
// import { isAuthorized } from '@/utils/helpers';
import { Message } from '@/modules/messages/entities/message.entity';

import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
// import { ConversationMiddleware } from './middlewares/conversation.middleware';
import { Conversation } from './entities/conversation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message]),
    UsersModule,
    FriendsModule,
  ],
  controllers: [ConversationsController],
  providers: [
    {
      provide: Services.CONVERSATIONS,
      useClass: ConversationsService,
    },
  ],
  exports: [
    {
      provide: Services.CONVERSATIONS,
      useClass: ConversationsService,
    },
  ],
})
export class ConversationsModule implements NestModule {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  configure(consumer: MiddlewareConsumer) {
    // consumer
    //   .apply(isAuthorized, ConversationMiddleware)
    //   .forRoutes('conversations/:id');
  }
}
