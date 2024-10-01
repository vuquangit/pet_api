import { HttpException, HttpStatus } from '@nestjs/common';

import { EXCEPTION_CODE } from '@/constants/exceptionCode';

export class FriendNotFoundException extends HttpException {
  constructor() {
    super(
      {
        code: EXCEPTION_CODE.FRIEND.NOT_FOUND,
        message: 'Friend Not Found',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
