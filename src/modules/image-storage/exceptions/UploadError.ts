import { HttpException, HttpStatus } from '@nestjs/common';
import { EXCEPTION_CODE } from '@/constants/exceptionCode';

export class UploadException extends HttpException {
  constructor(error: any) {
    super(
      {
        code: EXCEPTION_CODE.USER.UPDATE_ERROR,
        message: 'ERROR: ' + error,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
