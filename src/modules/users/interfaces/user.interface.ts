import { User } from '../entities/user.entity';
import { ERole } from '../enums/role.enum';

export interface IUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: ERole;
}

export type UpdateStatusMessageParams = {
  user: User;
  status_message: string;
};
