import { Factory, Seeder } from 'typeorm-seeding';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');

import { User } from '@/modules/users/entity/user.entity';
import { ERole } from '@/modules/users/enums/role.enum';

export class UserCreateSeed implements Seeder {
  public async run(factory: Factory): Promise<void> {
    const password = await bcrypt.hash(process.env.SEED_PASSWORD_OWNER, 12);

    await factory(User)().create({
      name: 'Owner',
      email: process.env.SEED_EMAIL_OWNER,
      password,
      role: ERole.SUPER_ADMIN,
      is_active: true,
    });
  }
}
