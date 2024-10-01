import { HttpException, HttpStatus } from '@nestjs/common';

import { EXCEPTION_CODE } from '@/constants/exceptionCode';

export class FriendRequestException extends HttpException {
  constructor(msg?: string) {
    const defaultMessage = 'Friend Request Exception';
    const _msg = msg ? defaultMessage.concat(': ', msg) : defaultMessage;
    const error = {
      code: EXCEPTION_CODE.FRIEND_REQUEST.EXCEPTION,
      message: _msg,
    };

    super(error, HttpStatus.BAD_REQUEST);
  }
}
