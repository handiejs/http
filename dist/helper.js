import { __awaiter, __rest } from "tslib";
import { isBoolean, isPlainObject, omit } from '@ntks/toolbox';
let globalBaseUrl = "";
function setGlobalBaseUrl(baseUrl) {
    globalBaseUrl = baseUrl;
}
function isServerSide(inServer) {
    if (isBoolean(inServer)) {
        return inServer;
    }
    try {
        return !window;
    }
    catch (error) {
        return true;
    }
}
function removeTailSlashes(str) {
    const tailRemoved = str.endsWith("/") ? str.slice(0, -1) : str;
    return tailRemoved.startsWith("/") ? tailRemoved.slice(1) : tailRemoved;
}
function resolveRequestUrl(baseUrl, url) {
    if (url.startsWith("http")) {
        return url;
    }
    const resolvedGlobalBaseUrl = removeTailSlashes(globalBaseUrl);
    let clientBaseUrl = "";
    if (baseUrl && baseUrl !== "/") {
        clientBaseUrl = baseUrl.startsWith("http") ? baseUrl : `/${removeTailSlashes(baseUrl)}`;
    }
    const prefixedUrl = url.startsWith("/") ? url : `/${url}`;
    return `${resolvedGlobalBaseUrl}${clientBaseUrl}${prefixedUrl}`;
}
function request(url_1, method_1, data_1) {
    return __awaiter(this, arguments, void 0, function* (url, method, data, config = {}) {
        const { baseUrl, headers } = config, others = __rest(config, ["baseUrl", "headers"]);
        let sendBody;
        if (["POST", "PUT"].includes(method)) {
            sendBody = JSON.stringify(data);
        }
        return yield fetch(resolveRequestUrl(baseUrl, url), Object.assign(Object.assign({}, omit(others, ["params"])), { headers: Object.assign({ "Content-Type": "application/json" }, headers), method, body: sendBody }));
    });
}
function isLogicalSuccess(code) {
    return code >= 200 && code < 300;
}
function generateSuccessResponse(data, message = "", statusCode = 200) {
    return {
        success: true,
        code: `${statusCode}`,
        message,
        data,
    };
}
function generateFailedResponse(message, statusCode = 500, extra) {
    return {
        success: false,
        code: `${statusCode}`,
        message,
        data: undefined,
        extra,
    };
}
function normalizeResponse(res) {
    return __awaiter(this, void 0, void 0, function* () {
        const jsonData = yield res.json();
        const defaultCode = `${res.status}`;
        if (res.ok) {
            if (isPlainObject(jsonData)) {
                const { success, code = defaultCode, message, data, extra } = jsonData, others = __rest(jsonData, ["success", "code", "message", "data", "extra"]);
                return {
                    success: success !== null && success !== void 0 ? success : isLogicalSuccess(Number(code)),
                    code,
                    message,
                    data,
                    extra: Object.assign(Object.assign({}, extra), others),
                };
            }
            return {
                success: true,
                code: defaultCode,
                message: "",
                data: jsonData,
                extra: {},
            };
        }
        let message;
        if (res.status === 404) {
            message = `\`${new URL(res.url).pathname}\` is not found`;
        }
        if (isPlainObject(jsonData)) {
            message = jsonData.message;
        }
        return generateFailedResponse(message !== null && message !== void 0 ? message : res.statusText, defaultCode, {});
    });
}
function normalizeRestfulResponse(res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`[HTTP] ${res.status} ${res.url}`);
        // Get the response text first to check if it's valid JSON
        const responseText = yield res.text();
        if (!responseText) {
            console.warn(`[HTTP] Empty response from: ${res.url}`);
            return generateFailedResponse("Empty response received", res.status);
        }
        let jsonData;
        try {
            jsonData = JSON.parse(responseText);
        }
        catch (error) {
            console.error(`[HTTP] JSON parse error for ${res.url}:`, error instanceof Error ? error.message : 'Unknown error');
            console.error(`[HTTP] Response content (first 200 chars):`, responseText.substring(0, 200));
            return generateFailedResponse(`Invalid JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`, res.status, { rawResponse: responseText.substring(0, 500) });
        }
        const defaultCode = `${res.status}`;
        if (res.ok) {
            return {
                success: isLogicalSuccess(res.status),
                code: defaultCode,
                message: "",
                data: jsonData,
                extra: {},
            };
        }
        let message;
        if (res.status === 404) {
            message = `\`${new URL(res.url).pathname}\` is not found`;
        }
        if (isPlainObject(jsonData)) {
            message = jsonData.message;
        }
        return generateFailedResponse(message !== null && message !== void 0 ? message : res.statusText, defaultCode, {});
    });
}
export { setGlobalBaseUrl, isServerSide, request, generateSuccessResponse, generateFailedResponse, normalizeResponse, normalizeRestfulResponse, };
