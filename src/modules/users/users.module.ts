import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { User } from './entities/user.entity';

import { AuthModule } from '@/modules/auth/auth.module';
import { MailingModule } from '@/modules/mailing/mailing.module';
import { Services } from '@/constants/constants';
import { UserPresenceService } from './services/user-presence.service';
import { UserPresenceController } from './controllers/user-presence.controller';
import { Peer } from './entities/peer.entit';
import { UserPresence } from './entities/UserPresence';
// import { UploadModule } from '@/modules/upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserPresence, Peer]),
    forwardRef(() => AuthModule),
    HttpModule,
    MailingModule,
    // UploadModule,
  ],
  controllers: [UsersController, UserPresenceController],
  providers: [
    UsersService,
    {
      provide: Services.USER_PRESENCE,
      useClass: UserPresenceService,
    },
  ],
  exports: [
    UsersService,
    {
      provide: Services.USER_PRESENCE,
      useClass: UserPresenceService,
    },
  ],
})
export class UsersModule {}
