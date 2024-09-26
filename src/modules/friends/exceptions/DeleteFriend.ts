import { HttpException, HttpStatus } from '@nestjs/common';

import { EXCEPTION_CODE } from '@/constants/exceptionCode';

export class DeleteFriendException extends HttpException {
  constructor() {
    super(
      {
        code: EXCEPTION_CODE.FRIEND.CANNOT_DELETE,
        message: 'Cannot Delete Friend',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
