import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '@/modules/users/users.module';
import { MailingModule } from '@/modules/mailing/mailing.module';
import { ImageStorageModule } from '@/modules/image-storage/image-storage.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    forwardRef(() => UsersModule),
    forwardRef(() => MailingModule),
    ImageStorageModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
  exports: [AuthService],
})
export class AuthModule {}
