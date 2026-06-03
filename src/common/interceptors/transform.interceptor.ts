import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';
import {
  ApiResponse,
  PaginatedMeta,
} from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const message =
      this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler()) ||
      'Success';

    return next.handle().pipe(
      map((result: T) => {
        if (
          result &&
          typeof result === 'object' &&
          'items' in result &&
          'meta' in result
        ) {
          const { items, meta } = result as { items: T; meta: PaginatedMeta };
          return {
            success: true,
            message,
            data: items,
            meta,
          };
        }

        return {
          success: true,
          message,
          data: result !== undefined && result !== null ? result : null,
        };
      }),
    );
  }
}
