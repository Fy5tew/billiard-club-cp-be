import { SetMetadata } from '@nestjs/common';

import { UserRole } from '@app/shared/dtos/user.dto';

import { ACCESS_ROLE_KEY, IS_PUBLIC_KEY } from './auth.constants';

export const PublicRoute = () => SetMetadata(IS_PUBLIC_KEY, true);

export const RoleAccess = (role: UserRole) =>
  SetMetadata(ACCESS_ROLE_KEY, role);
