import { User } from '@/modules/users/entities/user.entity';
import { ERole } from '@/modules/users/enums/role.enum';
import { ObjectId } from 'mongodb';

export const mockUser: User = {
  _id: new ObjectId('4444000455'),
  email: 'test@test.com',
  name: 'Test User',
  username: 'Username',
  password: 'djiasdhjdgdhjasd',
  role: ERole.USER,
  avatar_url: '',
  address: '',
  phone: '',
  birthday: new Date(),
  is_active: true,
  note: '',
  peer_id: '',
  created_at: new Date(),
  updated_at: new Date(),
  reset_token: '',
  reset_token_expiry: new Date(),
  peer: null,
  presence_id: '',
  presence: null,
};
