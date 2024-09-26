import { UsersModule } from '@/modules/users/users.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Friend } from './entities/friend.entity';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { Services } from '@/constants/constants';

@Module({
  imports: [TypeOrmModule.forFeature([Friend]), UsersModule],
  providers: [
    {
      provide: Services.FRIENDS_SERVICE,
      useClass: FriendsService,
    },
  ],
  controllers: [FriendsController],
  exports: [
    {
      provide: Services.FRIENDS_SERVICE,
      useClass: FriendsService,
    },
  ],
})
export class FriendsModule {}
