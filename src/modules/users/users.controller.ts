/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Delete,
  Put,
  Query,
  UseInterceptors,
  ParseIntPipe,
  UploadedFile,
  ParseBoolPipe,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UpdateResult } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';

import { CreateUserDto } from '@/modules/users/dtos/CreateUser.dto';

import { AccessTokenGuard } from '@/modules/auth/guards/accessToken-auth.guard';
import { UsersService } from '@/modules/users/users.service';
import { User } from '@/modules/users/entity/user.entity';
import { PageDto } from '@/common/dtos/page.dto';

@Controller()
@UseGuards(AccessTokenGuard)
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post('user')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        fieldSize: 5120,
      },
    }),
  )
  create(
    @Body() createdUserDto: CreateUserDto,
    @UploadedFile() avatar: any,
    @Body('role', ParseIntPipe) role: number,
    @Body('is_active', ParseBoolPipe) is_active: boolean,
  ): Observable<User> {
    return this.userService.create({
      ...createdUserDto,
      role,
      avatar,
      is_active,
    });
  }

  @Get('users')
  findAll(
    @Query() query?: any,
    // @Request() req?: any,
  ): Observable<PageDto<User[]>> {
    // const user = req.user;
    return this.userService.findAll(query);
  }

  @Get('user/:id')
  findUser(
    @Param('id') id: string,
    @Query('include') include: string,
  ): Observable<User | null> {
    return this.userService.findById(id);
  }

  @Put('user/:id')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        fieldSize: 5120,
      },
    }),
  )
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: CreateUserDto,
    @UploadedFile() avatar: any,
    @Body('role', ParseIntPipe) role: any,
    @Body('is_active', ParseBoolPipe) is_active: boolean,
    @Body('is_delete_avatar', ParseBoolPipe) is_delete_avatar: boolean,
  ): Observable<UpdateResult> {
    return this.userService.update(id, {
      ...updateUserDto,
      role,
      avatar,
      is_active,
      is_delete_avatar,
    });
  }

  @Delete('user/:id')
  remove(@Param('id') id: string): Observable<any> {
    return this.userService.remove(id);
  }
}
