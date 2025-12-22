import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserRole } from '@app/shared/dtos/user.dto';
import { RequestWithUser } from '@app/shared/types/auth.types';

import { ACCESS_ROLE_KEY } from './auth.constants';

export class RoleAccessGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const role = this.reflector.getAllAndOverride<UserRole>(ACCESS_ROLE_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!role) return true;

    const { user } = ctx.switchToHttp().getRequest<RequestWithUser>();
    return user.role >= role;
  }
}
