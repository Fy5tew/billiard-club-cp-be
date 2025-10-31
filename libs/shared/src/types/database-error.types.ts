export enum DatabaseErrorCode {
  // === Class 22 — Data Exception ===
  INVALID_TEXT_REPRESENTATION = '22P02', // invalid_input_syntax, например неверный UUID
  NUMERIC_VALUE_OUT_OF_RANGE = '22003',
  NOT_NULL_VIOLATION = '23502',
  STRING_DATA_RIGHT_TRUNCATION = '22001',

  // === Class 23 — Integrity Constraint Violation ===
  UNIQUE_VIOLATION = '23505',
  FOREIGN_KEY_VIOLATION = '23503',
  CHECK_VIOLATION = '23514',
  EXCLUSION_VIOLATION = '23P01',

  // === Class 40 — Transaction Rollback ===
  TRANSACTION_ROLLBACK = '40000',
  SERIALIZATION_FAILURE = '40001',
  DEADLOCK_DETECTED = '40P01',
  STATEMENT_COMPLETION_UNKNOWN = '40003',

  // === Class 42 — Syntax Error or Access Rule Violation ===
  SYNTAX_ERROR_OR_ACCESS_RULE_VIOLATION = '42000',
  INSUFFICIENT_PRIVILEGE = '42501',
  UNDEFINED_TABLE = '42P01',
  UNDEFINED_COLUMN = '42703',
  UNDEFINED_FUNCTION = '42883',
  DUPLICATE_COLUMN = '42701',
  DUPLICATE_TABLE = '42P07',

  // === Class 08 — Connection Exception ===
  CONNECTION_EXCEPTION = '08000',
  CONNECTION_DOES_NOT_EXIST = '08003',
  CONNECTION_FAILURE = '08006',
  SQLCLIENT_UNABLE_TO_ESTABLISH_SQLCONNECTION = '08001',
  SQLSERVER_REJECTED_ESTABLISHMENT_OF_SQLCONNECTION = '08004',
  TRANSACTION_RESOLUTION_UNKNOWN = '08007',
  PROTOCOL_VIOLATION = '08P01',

  // === Class 25 — Invalid Transaction State ===
  INVALID_TRANSACTION_STATE = '25000',
  ACTIVE_SQL_TRANSACTION = '25001',
  INAPPROPRIATE_ACCESS_MODE_FOR_BRANCH_TRANSACTION = '25003',
  INAPPROPRIATE_ISOLATION_LEVEL_FOR_BRANCH_TRANSACTION = '25008',
  NO_ACTIVE_SQL_TRANSACTION = '25P01',

  // === Class 28 — Invalid Authorization Specification ===
  INVALID_AUTHORIZATION_SPECIFICATION = '28000',
  INVALID_PASSWORD = '28P01',

  // === Class 3D — Invalid Catalog Name ===
  INVALID_CATALOG_NAME = '3D000',

  // === Class 3F — Invalid Schema Name ===
  INVALID_SCHEMA_NAME = '3F000',

  // === Class 42 — Other Object Definitions ===
  DUPLICATE_DATABASE = '42P04',

  // === Class 53 — Insufficient Resources ===
  INSUFFICIENT_RESOURCES = '53000',
  DISK_FULL = '53100',
  OUT_OF_MEMORY = '53200',
  TOO_MANY_CONNECTIONS = '53300',
  CONFIGURATION_LIMIT_EXCEEDED = '53400',

  // === Class 55 — Object Not In Prerequisite State ===
  OBJECT_NOT_IN_PREREQUISITE_STATE = '55000',
  OBJECT_IN_USE = '55006',
  CANT_CHANGE_RUNTIME_PARAM = '55P02',

  // === Class 57 — Operator Intervention ===
  QUERY_CANCELED = '57014',
  ADMIN_SHUTDOWN = '57P01',
  CRASH_SHUTDOWN = '57P02',
  CANNOT_CONNECT_NOW = '57P03',

  // === Class F0 — Configuration File Error ===
  CONFIG_FILE_ERROR = 'F0000',
  LOCK_FILE_EXISTS = 'F0001',

  // === Class HV — FDW Error (Foreign Data Wrapper) ===
  FDW_ERROR = 'HV000',
  FDW_COLUMN_NAME_NOT_FOUND = 'HV005',
  FDW_TABLE_NOT_FOUND = 'HV00R',
  FDW_UNABLE_TO_CREATE_EXECUTION = 'HV014',

  // === Class P0 — PL/pgSQL Error ===
  PLPGSQL_ERROR = 'P0000',
  RAISE_EXCEPTION = 'P0001',
  NO_DATA_FOUND = 'P0002',
  TOO_MANY_ROWS = 'P0003',

  // === Class XX — Internal Error ===
  INTERNAL_ERROR = 'XX000',
  DATA_CORRUPTED = 'XX001',
  INDEX_CORRUPTED = 'XX002',
}

export type DatabaseError = {
  code: DatabaseErrorCode;
  message?: string;
  detail?: string;
  table?: string;
  constraint?: string;
  column?: string;
};
