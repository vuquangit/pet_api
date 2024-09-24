import { Module } from '@nestjs/common';

import { GatewayModule } from '@/modules/gateway/gateway.module';
import { FriendRequestsEvents } from './friend-requests.events';
import { FriendEvents } from './friends.events';

@Module({
  imports: [GatewayModule],
  providers: [FriendRequestsEvents, FriendEvents],
})
export class EventsModule {}
