import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
export interface Response<T> {
  success: boolean;
  status: 'success' | 'error';
  message: string;
  data?: T;
  meta?: unknown;
  status_code?: number;
}

const isResponsePayload = <T>(payload: unknown): payload is Response<T> => {
  if (payload === null || typeof payload !== 'object') {
    return false;
  }

  return (
    'success' in payload &&
    typeof (payload as Response<T>).success === 'boolean' &&
    'status' in payload &&
    typeof (payload as Response<T>).status === 'string' &&
    'message' in payload &&
    typeof (payload as Response<T>).message === 'string'
  );
};

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T | Response<T>>,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((payload: T | Response<T>): Response<T> => {
        if (isResponsePayload<T>(payload)) {
          return payload;
        }

        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode || 200;
        
        return {
          success: true,
          status: 'success',
          message: 'Operation successful',
          data: payload,
          status_code: statusCode,
        };
      }),
    );
  }
}
