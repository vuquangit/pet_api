import {
  Body,
  Controller,
  Inject,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UpdatePresenceStatusDto } from '../dtos/UpdatePresenceStatus.dto';
import { AccessTokenGuard } from '@/modules/auth/guards/accessToken-auth.guard';
import { Routes, Services } from '@/constants/constants';
import { User } from '../entities/user.entity';
import { IUserPresenceService } from '../interfaces/user-presence';

@UseGuards(AccessTokenGuard)
@Controller(Routes.USER_PRESENCE)
export class UserPresenceController {
  constructor(
    @Inject(Services.USER_PRESENCE)
    private readonly userPresenceService: IUserPresenceService,
  ) {}

  @Patch('status')
  updateStatus(
    @Request() req: { user: User },
    @Body() { status_message }: UpdatePresenceStatusDto,
  ) {
    const user = req.user;
    return this.userPresenceService.updateStatus({ user, status_message });
  }
}
