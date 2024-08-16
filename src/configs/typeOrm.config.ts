import { DataSource, DataSourceOptions } from 'typeorm';
import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { User } from '@/modules/users/entity/user.entity';
import { Dinosaur } from '@/modules/dinosaur/entity/dinosaur.entity';

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
  entities: [User, Dinosaur],

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
