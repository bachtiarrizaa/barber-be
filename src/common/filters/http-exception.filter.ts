import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface CustomError {
  field?: string;
  message: string;
}

interface ErrorResponse {
  success: boolean;
  message: string;
  errors: CustomError[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message = 'Internal server error';
    let errors: CustomError[] = [];

    if (exceptionResponse) {
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resObj = exceptionResponse as Record<string, unknown>;

        const messageVal = resObj.message as string | string[] | undefined;
        if (messageVal) {
          message = Array.isArray(messageVal) ? messageVal[0] : messageVal;
        }

        if ('errors' in resObj && Array.isArray(resObj.errors)) {
          errors = resObj.errors as CustomError[];
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (errors.length === 0) {
      errors = [{ message }];
    }

    const payload: ErrorResponse = {
      success: false,
      message,
      errors,
    };

    response.status(status).json(payload);
  }
}
