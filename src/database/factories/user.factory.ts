import { define } from 'typeorm-seeding';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Faker from 'faker';

import { User } from '@/modules/users/entities/user.entity';
// import { ERole } from '@/modules/users/enums/role.enum';

define(User, (faker: typeof Faker) => {
  const user = new User();
  user.name = faker.name.lastName();
  user.email = faker.internet.email();
  user.password = faker.internet.password();
  user.role = 1; // FIXME: get enum
  return user;
});
