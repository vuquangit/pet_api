import { HttpException, HttpStatus } from '@nestjs/common';

import { EXCEPTION_CODE } from '@/constants/exceptionCode';

export class ProfileNotFoundException extends HttpException {
  constructor() {
    super(
      {
        code: EXCEPTION_CODE.AUTH.ACCESS_TOKEN_EXPIRED,
        message: 'Profile not found',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
