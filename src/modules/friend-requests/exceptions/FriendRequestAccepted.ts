import { HttpException, HttpStatus } from '@nestjs/common';

import { EXCEPTION_CODE } from '@/constants/exceptionCode';

export class FriendRequestAcceptedException extends HttpException {
  constructor() {
    super(
      {
        code: EXCEPTION_CODE.FRIEND_REQUEST.ALREADY_ACCEPTED,
        message: 'Friend Request Already Accepted',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
