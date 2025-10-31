export type IRpcError = {
  statusCode: number;
  message: string | string[];
  error: string;
};

export type IDeserializedRpcError = {
  message: string;
  error: IRpcError;
};
