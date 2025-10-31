import { QueryFailedError } from 'typeorm';

import {
  DatabaseError,
  DatabaseErrorCode,
} from '../constants/database-error.constants';

type DatabaseErrorHandlerContext<T extends (...args: any[]) => any> = {
  error: DatabaseError;
  args: Parameters<T>;
  thisArg: ThisParameterType<T>;
};

type DatabaseErrorHandler<T extends (...args: any[]) => any> = (
  context: DatabaseErrorHandlerContext<T>,
) => void | Promise<void>;

type DatabaseErrorHandlerMap<T extends (...args: any[]) => any> = Partial<
  Record<DatabaseErrorCode, DatabaseErrorHandler<T>>
>;

export function CatchDatabaseErrors<
  T extends (...args: any[]) => Promise<unknown>,
>(
  handler: DatabaseErrorHandler<T>,
): (
  target: object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => void {
  return (
    _target: object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ): void => {
    const originalMethod = descriptor.value;

    if (!originalMethod) {
      throw new Error(
        `@${CatchDatabaseErrors.name} can only be applied to methods`,
      );
    }

    const wrappedMethod = async function (
      this: ThisParameterType<T>,
      ...args: Parameters<T>
    ): Promise<Awaited<ReturnType<T>>> {
      try {
        const result: unknown = await originalMethod.apply(this, args);
        return result as Awaited<ReturnType<T>>;
      } catch (error: unknown) {
        if (error instanceof QueryFailedError) {
          const dbError = error.driverError as DatabaseError;
          await handler.call(this, { error: dbError, args, thisArg: this });
        }
        throw error;
      }
    };

    descriptor.value = wrappedMethod as unknown as T;
  };
}

export function CatchDatabaseError<
  T extends (...args: any[]) => Promise<unknown>,
>(targetErrorCode: DatabaseErrorCode, handler: DatabaseErrorHandler<T>) {
  return CatchDatabaseErrors<T>(async (context) => {
    if (context.error.code === targetErrorCode) {
      await handler(context);
    }
  });
}

export function CatchDatabaseErrorsMap<
  T extends (...args: any[]) => Promise<unknown>,
>(handlers: DatabaseErrorHandlerMap<T>) {
  return CatchDatabaseErrors<T>(async (context) => {
    const handler = handlers[context.error.code];
    if (handler) {
      await handler(context);
    }
  });
}
