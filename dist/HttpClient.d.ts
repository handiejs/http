import type { DataValue } from "@handie/runtime-core";
import type { ResponseInterceptor, RequestConfig, HttpClientInitializer, IHttpClient } from "./typing";
declare class HttpClient implements IHttpClient {
    private baseUrl?;
    private headers?;
    private normalizeResponse;
    private resInterceptor?;
    constructor({ baseUrl, headers, normalizer }: HttpClientInitializer);
    private setInterceptor;
    private request;
    get(url: string, config?: RequestConfig): Promise<import("./typing").ResponseResult<any, Record<string, any>>>;
    post(url: string, data?: Record<string, DataValue>, config?: RequestConfig): Promise<import("./typing").ResponseResult<any, Record<string, any>>>;
    put(url: string, data?: Record<string, DataValue>, config?: RequestConfig): Promise<import("./typing").ResponseResult<any, Record<string, any>>>;
    use(interceptor: ResponseInterceptor): void;
}
export default HttpClient;
