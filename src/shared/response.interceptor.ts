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
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const url = request.url.split('?')[0];

        // Handle message-only responses
        if (
          payload &&
          typeof payload === 'object' &&
          'message' in payload &&
          Object.keys(payload).length === 1
        ) {
          return {
            success: true,
            status: 'success',
            message: (payload as { message: string }).message,
            status_code: statusCode,
          };
        }

        // Get appropriate message based on endpoint
        let message = 'Operation successful';
        if (method === 'POST' && url.endsWith('/auth/register')) {
          message =
            'User registered successfully. Please check your email for verification.';
        } else if (method === 'POST' && url.endsWith('/auth/login')) {
          message = 'Login successful';
        } else if (method === 'POST' && url.endsWith('/auth/google')) {
          message = 'Google login successful';
        } else if (method === 'POST' && url.endsWith('/auth/refresh')) {
          message = 'Tokens refreshed successfully';
        }

        return {
          success: true,
          status: 'success',
          message,
          data: payload,
          status_code: statusCode,
        };
      }),
    );
  }
}
