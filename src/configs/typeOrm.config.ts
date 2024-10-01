import { DataSource, DataSourceOptions } from 'typeorm';
import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { User } from '@/modules/users/entities/user.entity';
import { Dinosaur } from '@/modules/dinosaur/entities/dinosaur.entity';
import { Friend } from '@/modules/friends/entities/friend.entity';
import { FriendRequest } from '@/modules/friend-requests/entities/friendRequest.entity';
import { Session } from '@/modules/gateway/entities/session.entity';
import { Conversation } from '@/modules/conversations/entities/conversation.entity';
import { Message } from '@/modules/messages/entities/message.entity';
import { Group } from '@/modules/groups/entities/Group';
import { GroupMessage } from '@/modules/groups/entities/GroupMessage';
import { Peer } from '@/modules/users/entities/peer.entit';
import { UserPresence } from '@/modules/users/entities/UserPresence';

dotenvConfig({ path: '.env' });

const config: TypeOrmModuleOptions = {
  type: 'mongodb',
  url: process.env.MONGO_DB_URI,
  // ssl: true,
  // sslValidate: true,
  // sslCA: [process.env.MONGO_DB_SSL_CA],
  // sslCert: process.env.MONGO_DB_SSL_CERT,
  // sslKey: process.env.MONGO_DB_SSL_KEY,
  // sslPass: process.env.MONGO_DB_SSL_PASS,
  // sslCRL: process.env.MONGO_DB_SSL_CRL,

  // Migration
  entities: [
    User,
    Dinosaur,
    Friend,
    FriendRequest,
    Session,
    Conversation,
    Message,
    Group,
    GroupMessage,
    Peer,
    UserPresence,
  ],

  // Only enable this option if your application is in development,
  // otherwise use TypeORM migrations to sync entity schemas:
  // https://typeorm.io/#/migrations
  synchronize: true,

  logging: true,
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations_history',
};

export const configRaw = config;

export default registerAs('typeorm-mongo', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
