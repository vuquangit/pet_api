import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';

import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { MailingModule } from '../mailing/mailing.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    forwardRef(() => UsersModule),
    forwardRef(() => MailingModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
  exports: [AuthService],
})
export class AuthModule {}
