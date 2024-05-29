import { DataSource, DataSourceOptions } from 'typeorm';
import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';

import { User } from '@/modules/users/entity/user.entity';

dotenvConfig({ path: '.env' });

const config = {
  type: 'postgres',
  host: process.env.POSTGRESQL_DB_HOST,
  // port: +(process?.env?.POSTGRESQL_DB_DOCKER_PORT || 5432),
  port: +(process?.env?.POSTGRESQL_DB_PORT || 5432),
  username: process.env.POSTGRESQL_DB_USER,
  password: process.env.POSTGRESQL_DB_PASSWORD,
  database: process.env.POSTGRESQL_DB_DATABASE,

  // Migration
  entities: [User],
  synchronize: false,
  logging: true,
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations_history',
};

export const configRaw = config;

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
