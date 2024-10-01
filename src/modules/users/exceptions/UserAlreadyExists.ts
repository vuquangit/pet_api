import { EXCEPTION_CODE } from '@/constants/exceptionCode';
import { HttpException, HttpStatus } from '@nestjs/common';

export class UserAlreadyExists extends HttpException {
  constructor() {
    super(
      {
        code: EXCEPTION_CODE.USER.EMAIL_EXIST,
        message: 'User already exists',
      },
      HttpStatus.CONFLICT,
    );
  }
}
