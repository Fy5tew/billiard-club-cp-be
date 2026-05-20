export enum BookingsRoute {
  BASE = 'bookings',
  MANUAL = 'manual',
  MY = 'my',
  AVAILABLE_TABLES = 'available-tables',
  BOOKED_SLOTS_FOR_BILLIARD_TABLE = 'slots/:billiardTableId',
  BOOKING = ':id',
  BOOKING_STATUS = ':id/status',
  CANCEL_BOOKING = ':id/cancel',
  CONFIRM_BOOKING = ':id/confirm',
  REJECT_BOOKING = ':id/reject',
  PAY_BOOKING = ':id/pay',
  PAY_BOOKING_MANUAL = ':id/pay/manual',
}
