import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

import { IRpcError } from '../types/rpc-error.types';

@Catch(RpcException)
export class RpcToHttpExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const rpcError = exception.getError() as IRpcError;

    const status = rpcError.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = rpcError.message || 'Internal Server Error';

    response.status(status).json({
      statusCode: status,
      error: rpcError.error,
      message: message,
    });
  }
}
