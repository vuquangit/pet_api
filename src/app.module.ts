import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';

import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { mailerConfig, postgresqlConfig, typeOrm } from '@/configs';

import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { MailingModule } from '@/modules/mailing/mailing.module';
import { OauthModule } from '@/modules/oauth/oauth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      load: [typeOrm],
    }),
    TypeOrmModule.forRootAsync(postgresqlConfig),
    MailerModule.forRootAsync(mailerConfig),

    // modules
    AuthModule,
    OauthModule,
    UsersModule,
    MailingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
