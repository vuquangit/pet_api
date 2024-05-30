import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entity/user.entity';

import { AuthModule } from '@/modules/auth/auth.module';
import { MailingModule } from '@/modules/mailing/mailing.module';
// import { UploadModule } from '@/modules/upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    HttpModule,
    MailingModule,
    // UploadModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
