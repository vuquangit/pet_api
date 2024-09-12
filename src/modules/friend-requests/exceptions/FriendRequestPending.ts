import { HttpException, HttpStatus } from '@nestjs/common';

import { EXCEPTION_CODE } from '@/constants/exceptionCode';

export class FriendRequestPending extends HttpException {
  constructor() {
    super(
      {
        code: EXCEPTION_CODE.FRIEND_REQUEST.PENDING,
        message: 'Friend Requesting Pending',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
