import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseDto } from '../dtos';

@Catch(HttpException)
export class HttpExceptionFilter<T> implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const _error =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      exception?.response.error ||
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      exception?.response.message ||
      exception?.message;

    const responseJson: ResponseDto<T> = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      error: _error,
      result: null,
    };

    response.status(status).json(responseJson);
  }
}
