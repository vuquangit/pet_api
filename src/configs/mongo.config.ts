import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const mongoConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  useFactory: async (configService: ConfigService) =>
    configService.get('typeorm-mongo'),
};
