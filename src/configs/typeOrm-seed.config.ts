import { configRaw } from './typeOrm.config';

export default {
  ...configRaw,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  seeds: ['src/database/seeds/**/*{.ts,.js}'],
  factories: ['src/database/factories/**/*{.ts,.js}'],
};
