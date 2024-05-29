import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { postgresqlConfig, typeOrm } from '@/configs';

import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      load: [typeOrm],
    }),
    TypeOrmModule.forRootAsync(postgresqlConfig),

    // modules
    AuthModule,
    UsersModule,
    // MailingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
