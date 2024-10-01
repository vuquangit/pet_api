import { HttpException, HttpStatus } from '@nestjs/common';

import { EXCEPTION_CODE } from '@/constants/exceptionCode';

export class FriendRequestNotFoundException extends HttpException {
  constructor() {
    super(
      {
        code: EXCEPTION_CODE.FRIEND_REQUEST.NOT_FOUND,
        message: 'Friend Request not found',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
