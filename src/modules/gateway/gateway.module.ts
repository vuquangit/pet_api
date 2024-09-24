import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { ConversationsModule } from '@/modules/conversations/conversations.module';
import { FriendsModule } from '@/modules/friends/friends.module';
import { GroupModule } from '@/modules/groups/group.module';
import { UsersModule } from '@/modules/users/users.module';
import { Services } from '@/constants/constants';
import { MessagingGateway } from './gateway';
import { GatewaySessionManager } from './gateway.session';

@Module({
  imports: [
    ConversationsModule,
    GroupModule,
    FriendsModule,
    UsersModule,
    ConfigModule,
    JwtModule.register({}),
  ],
  providers: [
    MessagingGateway,
    {
      provide: Services.GATEWAY_SESSION_MANAGER,
      useClass: GatewaySessionManager,
    },
  ],
  exports: [
    MessagingGateway,
    {
      provide: Services.GATEWAY_SESSION_MANAGER,
      useClass: GatewaySessionManager,
    },
  ],
})
export class GatewayModule {}
