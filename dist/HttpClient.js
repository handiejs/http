import { __awaiter, __rest } from "tslib";
import { isFunction, isPlainObject } from '@ntks/toolbox';
import { isServerSide, request, normalizeResponse } from "./helper";
class HttpClient {
    constructor({ baseUrl, headers, normalizer = normalizeResponse }) {
        this.baseUrl = baseUrl;
        this.headers = headers;
        this.normalizeResponse = normalizer;
    }
    setInterceptor(interceptor) {
        this.resInterceptor = interceptor;
    }
    request(url_1, method_1, data_1) {
        return __awaiter(this, arguments, void 0, function* (url, method, data, config = {}) {
            const { inServer, headers } = config, others = __rest(config, ["inServer", "headers"]);
            const res = yield request(url, method, data, Object.assign(Object.assign({}, others), { baseUrl: this.baseUrl, inServer: isServerSide(inServer), headers: Object.assign(Object.assign({}, this.headers), headers) }));
            const normalized = yield this.normalizeResponse(res);
            return this.resInterceptor ? this.resInterceptor(normalized, config, res) : normalized;
        });
    }
    get(url_1) {
        return __awaiter(this, arguments, void 0, function* (url, config = {}) {
            const { params } = config, others = __rest(config, ["params"]);
            const queryString = isPlainObject(params) ? (new URLSearchParams(params)).toString() : "";
            return this.request(queryString ? `${url}?${queryString}` : url, "GET", "", others);
        });
    }
    post(url, data, config) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request(url, "POST", data ? data : {}, config);
        });
    }
    put(url, data, config) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request(url, "PUT", data ? data : {}, config);
        });
    }
    use(interceptor) {
        if (isFunction(interceptor)) {
            this.setInterceptor(interceptor);
        }
    }
}
export default HttpClient;
