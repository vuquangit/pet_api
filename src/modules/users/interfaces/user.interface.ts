import { ERole } from '../enums/role.enum';

export interface IUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: ERole;
}
