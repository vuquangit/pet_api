import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FriendsModule } from '../friends/friends.module';
import { UsersModule } from '../users/users.module';
import { Services } from '@/constants/constants';
import { Friend } from '@/modules/friends/entities/friend.entity';
import { FriendRequest } from '@/modules/friend-requests/entities/friendRequest.entity';
import { FriendRequestController } from './friend-requests.controller';
import { FriendRequestService } from './friend-requests.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Friend, FriendRequest]),
    UsersModule,
    FriendsModule,
  ],
  controllers: [FriendRequestController],
  providers: [
    {
      provide: Services.FRIENDS_REQUESTS_SERVICE,
      useClass: FriendRequestService,
    },
  ],
})
export class FriendRequestsModule {}
