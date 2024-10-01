import { HttpException, HttpStatus } from '@nestjs/common';

import { EXCEPTION_CODE } from '@/constants/exceptionCode';

export class FriendAlreadyExists extends HttpException {
  constructor() {
    super(
      {
        code: EXCEPTION_CODE.FRIEND.ALREADY_EXISTS,
        message: 'Friend Already Exists',
      },
      HttpStatus.CONFLICT,
    );
  }
}
