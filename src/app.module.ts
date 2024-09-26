import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { mailerConfig, mongoConfig, typeOrmMongo } from '@/configs';
import { ThrottlerBehindProxyGuard } from '@/utils/throttler';

import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { MailingModule } from '@/modules/mailing/mailing.module';
import { OauthModule } from '@/modules/oauth/oauth.module';
import { DinosaurModule } from '@/modules/dinosaur/dinosaur.module';
import { FriendsModule } from '@/modules/friends/friends.module';
import { EventsModule } from '@/modules/events/events.module';
import { FriendRequestsModule } from '@/modules/friend-requests/friend-requests.module';
import { ConversationsModule } from '@/modules/conversations/conversations.module';
import { MessagesModule } from '@/modules/messages/messages.module';
import { GroupModule } from '@/modules/groups/group.module';
import { ExistsModule } from '@/modules/exists/exists.module';
import { GatewayModule } from '@/modules/gateway/gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      load: [typeOrmMongo],
    }),
    TypeOrmModule.forRootAsync(mongoConfig),
    MailerModule.forRootAsync(mailerConfig),

    // modules
    AuthModule,
    OauthModule,
    UsersModule,
    MailingModule,
    DinosaurModule,

    // for chat
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 10,
        limit: 10,
      },
    ]),
    EventsModule,
    FriendsModule,
    FriendRequestsModule,
    ConversationsModule,
    MessagesModule,
    GroupModule,
    ExistsModule,
    GatewayModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export class AppModule {}
