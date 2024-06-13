import { DataSource, DataSourceOptions } from 'typeorm';
import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';

import { User } from '@/modules/users/entity/user.entity';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

dotenvConfig({ path: '.env' });

const config: TypeOrmModuleOptions = {
  type: 'mongodb',
  host: process.env.MONGO_DB_HOST,
  database: process.env.MONGO_DB_DATABASE,
  port: +(process?.env?.MONGO_DB_PORT || 27017),
  // username: process.env.MONGO_DB_USER,
  // password: process.env.MONGO_DB_PASSWORD,

  // Migration
  entities: [User],

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
