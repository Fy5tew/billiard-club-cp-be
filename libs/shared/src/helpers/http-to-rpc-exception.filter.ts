import { Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(HttpException)
export class HttpToRpcExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException) {
    const httpResponse = exception.getResponse();
    throw new RpcException(httpResponse);
  }
}
