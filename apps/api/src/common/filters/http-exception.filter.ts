import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      error: typeof message === 'string' ? message : (message as any).error || 'Error',
      message: typeof message === 'string' ? message : (message as any).message || 'An error occurred',
      timestamp: new Date().toISOString(),
      path: request.url,
      correlationId: request['correlationId'],
    };

    // Log the error with stack trace
    this.logger.error(
      JSON.stringify({
        ...errorResponse,
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    );

    response.status(status).json(errorResponse);
  }
}
