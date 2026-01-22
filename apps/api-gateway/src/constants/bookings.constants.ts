export enum BookingsRoute {
  BASE = 'bookings',
  MY = 'my',
  FREE_SLOTS_FOR_BILLIARD_TABLE = 'slots/:billiardTableId',
  BOOKINGS_BY_USER = 'users/:userId',
  BOOKINGS_BY_BILLIARD_TABLE = 'tables/:billiardTableId',
  BOOKING = ':id',
  BOOKING_STATUS = ':id/status',
  CANCEL_BOOKING = ':id/cancel',
  CONFIRM_BOOKING = ':id/confirm',
  REJECT_BOOKING = ':id/reject',
  PAY_BOOKING = ':id/pay',
}
