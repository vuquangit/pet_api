import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Delete,
  Patch,
  Query,
  UseInterceptors,
  ParseIntPipe,
  UploadedFile,
  ParseBoolPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CreateUserDto } from '@/modules/users/dtos/CreateUser.dto';
import { AccessTokenGuard } from '@/modules/auth/guards/accessToken-auth.guard';
import { UsersService } from '@/modules/users/services/users.service';
import { User } from '@/modules/users/entities/user.entity';
import { PageDto } from '@/common/dtos/page.dto';
import { UpdateResult } from '@/common/interfaces/common.interface';
import { Routes } from '@/constants/constants';
import { UpdateUserDto } from '../dtos/UpdateUser.dto';

@Controller(Routes.USERS)
@UseGuards(AccessTokenGuard)
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        fieldSize: 5120,
      },
    }),
  )
  create(
    @Body() createdUserDto: CreateUserDto,
    @UploadedFile() avatar: Express.Multer.File,
    @Body('role', ParseIntPipe) role: number,
    @Body('is_active', ParseBoolPipe) is_active: boolean,
  ): Promise<User> {
    return this.userService.create({
      ...createdUserDto,
      role,
      avatar,
      is_active,
    });
  }

  @Get()
  findAll(
    @Query() query?: any,
    // @Request() req?: { user: User },
  ): Promise<PageDto<User[]>> {
    // const user = req.user;
    return this.userService.findAll(query);
  }

  @Get('search')
  searchUsers(@Query('query') query: string) {
    console.log(query);
    if (!query)
      throw new HttpException('Provide a valid query', HttpStatus.BAD_REQUEST);
    return this.userService.searchUsers(query);
  }

  @Get(':id')
  findUser(@Param('id') id: string): Promise<User | null> {
    return this.userService.findById(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        fieldSize: 5120,
      },
    }),
  )
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() avatar: Express.Multer.File,
    @Body('role', ParseIntPipe) role: any,
    @Body('is_active', ParseBoolPipe) is_active: boolean,
    @Body('is_delete_avatar', ParseBoolPipe) is_delete_avatar: boolean,
  ): Promise<UpdateResult | undefined> {
    return this.userService.update(id, {
      ...updateUserDto,
      role,
      avatar,
      is_active,
      is_delete_avatar,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<UpdateResult> {
    return await this.userService.remove(id);
  }
}
