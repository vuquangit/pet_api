import { User } from '../entities/user.entity';
import { UserPresence } from '../entities/UserPresence';
import { UpdateStatusMessageParams } from './user.interface';

export interface IUserPresenceService {
  createPresence(): Promise<UserPresence>;
  updateStatus(params: UpdateStatusMessageParams): Promise<User>;
}
