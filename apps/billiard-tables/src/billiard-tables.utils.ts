import { BILLIARD_TABLE_PHOTO_PREFIX } from './billiard-tables.constants';

export const getBilliardTablePhotoPath = (
  tableId: string,
  photoFilename: string,
): string => {
  return `${tableId}/${BILLIARD_TABLE_PHOTO_PREFIX}/${photoFilename}`;
};
