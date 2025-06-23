import { isBoolean, isPlainObject, omit } from '@ntks/toolbox';
import type { DataValue } from "@handie/runtime-core";

import type { RequestConfig, ResponseResult } from "./typing";

let globalBaseUrl = "";

function setGlobalBaseUrl(baseUrl: string): void {
  globalBaseUrl = baseUrl;
}

function isServerSide(inServer?: boolean): boolean {
  if (isBoolean(inServer)) {
    return <boolean>inServer;
  }

  try {
    return !window;
  } catch (error) {
    return true;
  }
}

function removeTailSlashes(str: string) {
  const tailRemoved = str.endsWith("/") ? str.slice(0, -1) : str;

  return tailRemoved.startsWith("/") ? tailRemoved.slice(1) : tailRemoved;
}

function resolveRequestUrl(baseUrl: string | undefined, url: string) {
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

async function request(
  url: string,
  method: string,
  data?: Record<string, DataValue> | string,
  config: RequestConfig = {},
) {
  const { baseUrl, headers, ...others } = config;

  let sendBody: string | undefined;

  if (["POST", "PUT"].includes(method)) {
    sendBody = JSON.stringify(data);
  }

  return await fetch(resolveRequestUrl(baseUrl, url), {
    ...omit(others, ["params"]),
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    method,
    body: sendBody,
  });
}

function isLogicalSuccess(code: number) {
  return code >= 200 && code < 300;
}

function generateSuccessResponse<VT extends DataValue = DataValue>(
  data: VT,
  message: string = "",
  statusCode: number | string = 200,
): ResponseResult<VT> {
  return {
    success: true,
    code: `${statusCode}`,
    message,
    data,
  };
}

function generateFailedResponse(message: string, statusCode: number | string = 500, extra?: ResponseResult["extra"]): ResponseResult<undefined> {
  return {
    success: false,
    code: `${statusCode}`,
    message,
    data: undefined,
    extra,
  };
}

async function normalizeResponse<VT extends DataValue = DataValue>(res: Response): Promise<ResponseResult<VT>> {
  const jsonData = await res.json();
  const defaultCode = `${res.status}`;

  if (res.ok) {
    if (isPlainObject(jsonData)) {
      const { success, code = defaultCode, message, data, extra, ...others } = jsonData;

      return {
        success: success ?? isLogicalSuccess(Number(code)),
        code,
        message,
        data,
        extra: { ...extra, ...others },
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

  let message: string | undefined;

  if (res.status === 404) {
    message = `\`${new URL(res.url).pathname}\` is not found`;
  } if (isPlainObject(jsonData)) {
    message = jsonData.message;
  }

  return generateFailedResponse(message ?? res.statusText, defaultCode, {}) as ResponseResult<VT>;
}

async function normalizeRestfulResponse<VT extends DataValue = DataValue>(res: Response): Promise<ResponseResult<VT>> {
  console.log(`[HTTP] ${res.status} ${res.url}`);

  // Get the response text first to check if it's valid JSON
  const responseText = await res.text();

  if (!responseText) {
    console.warn(`[HTTP] Empty response from: ${res.url}`);
    return generateFailedResponse("Empty response received", res.status) as ResponseResult<VT>;
  }

  let jsonData;

  try {
    jsonData = JSON.parse(responseText);
  } catch (error) {
    console.error(`[HTTP] JSON parse error for ${res.url}:`, error instanceof Error ? error.message : 'Unknown error');
    console.error(`[HTTP] Response content (first 200 chars):`, responseText.substring(0, 200));

    return generateFailedResponse(
      `Invalid JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`,
      res.status,
      { rawResponse: responseText.substring(0, 500) },
    ) as ResponseResult<VT>;
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

  let message: string | undefined;

  if (res.status === 404) {
    message = `\`${new URL(res.url).pathname}\` is not found`;
  } if (isPlainObject(jsonData)) {
    message = jsonData.message;
  }

  return generateFailedResponse(message ?? res.statusText, defaultCode, {}) as ResponseResult<VT>;
}

export {
  setGlobalBaseUrl,
  isServerSide, request,
  generateSuccessResponse, generateFailedResponse,
  normalizeResponse, normalizeRestfulResponse,
};
