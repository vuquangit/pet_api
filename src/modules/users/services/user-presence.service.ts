import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IUserPresenceService } from '../interfaces/user-presence';
import { User } from '../entities/user.entity';
import { UserPresence } from '../entities/UserPresence';
import { UpdateStatusMessageParams } from '../interfaces/user.interface';

@Injectable()
export class UserPresenceService implements IUserPresenceService {
  constructor(
    @InjectRepository(UserPresence)
    private readonly userPresenceRepository: Repository<UserPresence>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  createPresence(): Promise<UserPresence> {
    return this.userPresenceRepository.save(
      this.userPresenceRepository.create(),
    );
  }

  async updateStatus({
    user,
    status_message,
  }: UpdateStatusMessageParams): Promise<User> {
    console.log(user);
    if (!user.presence) {
      console.log('userDB.presence does not exist. creating');
      user.presence = await this.createPresence();
    }
    console.log('updating status...');
    user.presence.status_message = status_message;
    return this.usersRepository.save(user);
  }
}
