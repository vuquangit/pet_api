import { HttpException, HttpStatus } from '@nestjs/common';
import { EXCEPTION_CODE } from '@/constants/exceptionCode';

export class UserNotFoundException extends HttpException {
  constructor(id?: string) {
    super(
      {
        code: EXCEPTION_CODE.USER.ID_NOT_FOUND,
        message: id ? `A user id '"${id}"' was not found` : `User not found`,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
