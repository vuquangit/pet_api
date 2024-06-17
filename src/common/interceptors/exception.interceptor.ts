import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        const statusCode = err.status || 500;

        return throwError(
          () =>
            new HttpException(
              {
                success: false,
                statusCode,
                result: null,
                error: err?.response || err || 'Something went wrong',
                timestamp: new Date().toISOString(),
              },
              statusCode,
            ),
        );
      }),
    );
  }
}
