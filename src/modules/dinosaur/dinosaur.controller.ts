import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Delete,
  Query,
} from '@nestjs/common';

import { CreateDinosaurDto } from '@/modules/dinosaur/dtos/CreateDinosaur.dto';

import { AccessTokenGuard } from '@/modules/auth/guards/accessToken-auth.guard';
import { DinosaurService } from '@/modules/dinosaur/dinosaur.service';
import { Dinosaur } from '@/modules/dinosaur/entity/dinosaur.entity';
import { PageDto } from '@/common/dtos/page.dto';
import { UpdateResult } from '@/common/interfaces/common.interface';

@Controller('dinosaur')
@UseGuards(AccessTokenGuard)
export class DinosaurController {
  constructor(private dinosaurService: DinosaurService) {}

  @Post()
  create(@Body() bodyDto: CreateDinosaurDto): Promise<Dinosaur> {
    return this.dinosaurService.create(bodyDto);
  }

  @Get()
  findAll(@Query() query?: any): Promise<PageDto<Dinosaur[]>> {
    return this.dinosaurService.findAll(query);
  }

  @Get('/:id')
  findUser(@Param('id') id: string): Promise<Dinosaur | null> {
    return this.dinosaurService.findById(id);
  }

  @Delete('/:id')
  async remove(@Param('id') id: string): Promise<UpdateResult> {
    return await this.dinosaurService.remove(id);
  }
}
