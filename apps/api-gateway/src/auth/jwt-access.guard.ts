import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { catchError, isObservable, of } from 'rxjs';

import { IS_PUBLIC_KEY, JWT_ACCESS_STRATEGY } from './auth.constants';

@Injectable()
export class JwtAccessAuthGuard extends AuthGuard(JWT_ACCESS_STRATEGY) {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isPublic) {
      return super.canActivate(context);
    }

    const request = context.switchToHttp().getRequest<Request>();

    if (!request.headers.authorization) {
      return true;
    }

    try {
      const result = super.canActivate(context);

      if (isObservable(result)) {
        return result.pipe(catchError(() => of(true)));
      }

      if (result instanceof Promise) {
        return result.catch(() => true);
      }

      return result;
    } catch {
      return true;
    }
  }
}
