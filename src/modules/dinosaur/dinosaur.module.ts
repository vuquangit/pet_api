import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DinosaurService } from './dinosaur.service';
import { DinosaurController } from './dinosaur.controller';
import { Dinosaur } from './entities/dinosaur.entity';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Dinosaur]), UsersModule],
  controllers: [DinosaurController],
  providers: [DinosaurService],
  exports: [DinosaurService],
})
export class DinosaurModule {}
