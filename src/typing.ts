import type { DataValue, ResponseResult as HandieResponseResult } from "@handie/runtime-core";

type ResponseResult<
  ValueType extends DataValue = DataValue,
  ExtraType extends object = Record<string, DataValue>
> = Omit<HandieResponseResult<ValueType>, "extra"> & {
  extra?: ExtraType;
};

type RequestConfig = RequestInit & {
  baseUrl?: string;
  params?: Record<string, DataValue>;
  inServer?: boolean;
  noToast?: boolean;
};

type ResponseInterceptor = (normalizedResponse: ResponseResult, config: RequestConfig, rawResponse: Response) => ResponseResult;

type HttpClientInitializer = {
  baseUrl?: string;
  headers?: RequestConfig["headers"];
  normalizer?: (res: Response) => Promise<ResponseResult>;
};

interface IHttpClient {
  get: (url: string, config?: RequestConfig) => Promise<ResponseResult>;
  post: (url: string, data?: Record<string, DataValue>, config?: RequestConfig) => Promise<ResponseResult>;
  put: (url: string, data?: Record<string, DataValue>, config?: RequestConfig) => Promise<ResponseResult>;
  use: (interceptor: ResponseInterceptor) => void;
}

export type { ResponseResult, RequestConfig, ResponseInterceptor, HttpClientInitializer, IHttpClient };
