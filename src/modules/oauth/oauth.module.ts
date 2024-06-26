import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { OauthService } from './oauth.service';
import { OauthController } from './oauth.controller';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [AuthModule, HttpModule, UsersModule],
  controllers: [OauthController],
  providers: [OauthService, GoogleStrategy],
  exports: [OauthService],
})
export class OauthModule {}
