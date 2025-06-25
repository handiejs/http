import { isBoolean, isPlainObject } from '@ntks/toolbox';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function setGlobalBaseUrl(baseUrl) {
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
function normalizeRestfulResponse(res) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get the response text first to check if it's valid JSON
        const responseText = yield res.text();
        if (!responseText) {
            return generateFailedResponse('Empty response received', res.status);
        }
        let jsonData;
        try {
            jsonData = JSON.parse(responseText);
        }
        catch (error) {
            return generateFailedResponse(`Invalid JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`, res.status);
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

export { generateFailedResponse, generateSuccessResponse, isServerSide, normalizeRestfulResponse, setGlobalBaseUrl };
