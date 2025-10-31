import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { IDeserializedRpcError } from '../types/rpc-error.types';

@Injectable()
export class RpcClientErrorInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err: unknown) => {
        const rpcErrorWrapper = err as IDeserializedRpcError;
        const rpcError = rpcErrorWrapper.error;

        if (
          rpcError &&
          typeof rpcError.statusCode === 'number' &&
          rpcError.statusCode >= 100 &&
          rpcError.statusCode < 600
        ) {
          return throwError(() => new RpcException(rpcError));
        }

        return throwError(() => err);
      }),
    );
  }
}
