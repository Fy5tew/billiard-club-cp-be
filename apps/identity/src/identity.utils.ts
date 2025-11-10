import { UserId } from '@app/shared/dtos/user.dto';

import { USER_PROFILE_PHOTO_PREFIX } from './identity.constants';

export const getUserProfilePhotoPath = (
  userId: UserId,
  filename: string,
): string => {
  return `${userId}/${USER_PROFILE_PHOTO_PREFIX}/${filename}`;
};
