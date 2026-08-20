import { environment } from 'src/environments/environment';
import { AuthorizationMode } from './constant';
import { BehaviorSubject } from 'rxjs';

const apiUrl = environment.apiUrl;

/** Shared request activity for shells and feature views that need a global busy indicator. */
const activeRequestCount = new BehaviorSubject<number>(0);
export const apiLoading$ = activeRequestCount.asObservable();

export function isApiLoading(): boolean {
   return activeRequestCount.value > 0;
}

/** The envelope returned by the existing API controllers. */
export interface ApiResponse<T = any> {
   data?: T;
   message?: string;
   statusCode: number;
   objectLength: number;
   totalPage: number;
   [key: string]: any;
}

export type ApiQueryParams = Record<string, string | number | boolean | null | undefined>;

/** A non-2xx response that callers can handle without parsing fetch internals. */
export class ApiRequestError extends Error {
   constructor(
      public readonly status: number,
      public readonly url: string,
      public readonly response?: ApiResponse,
   ) {
      super(response?.message || `Request to ${url} failed with HTTP ${status}.`);
      this.name = 'ApiRequestError';
   }
}

export const convertPayloadToQueryString = (payload: ApiQueryParams = {}): string =>
   Object.entries(payload)
      .filter(([, value]) => value !== null && value !== undefined)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');

function buildUrl(path: string, params: ApiQueryParams = {}): string {
   const query = convertPayloadToQueryString(params);
   if (!query) return `${apiUrl}${path}`;
   return `${apiUrl}${path}${path.includes('?') ? '&' : '?'}${query}`;
}

function buildHeaders(authorizationMode: AuthorizationMode, isJsonBody: boolean): Headers {
   const headers = new Headers({ Accept: 'application/json' });
   if (isJsonBody) headers.set('Content-Type', 'application/json');

   if (authorizationMode === AuthorizationMode.BEARER_TOKEN) {
      try {
         const accessToken = localStorage.getItem('token');
         if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
      } catch {
         // SSR/private browsing can make localStorage unavailable; send anonymously.
      }
   }

   return headers;
}

async function parseResponse<T>(response: Response, url: string): Promise<T> {
   const contentType = response.headers.get('content-type') || '';
   const body = contentType.includes('application/json')
      ? await response.json() as ApiResponse
      : undefined;

   if (!response.ok) {
      throw new ApiRequestError(response.status, url, body);
   }

   return body as T;
}

async function request<T>(
   method: string,
   path: string,
   authorizationMode: AuthorizationMode,
   options: {
      body?: BodyInit;
      params?: ApiQueryParams;
      jsonBody?: boolean;
   } = {},
): Promise<T> {
   const url = buildUrl(path, options.params);
   activeRequestCount.next(activeRequestCount.value + 1);
   try {
      const response = await fetch(url, {
         method,
         cache: 'no-cache',
         headers: buildHeaders(authorizationMode, options.jsonBody === true),
         body: options.body,
      });

      return await parseResponse<T>(response, url);
   } finally {
      activeRequestCount.next(Math.max(0, activeRequestCount.value - 1));
   }
}

export function getRequest<T = ApiResponse>(
   url: string,
   authorizationMode: AuthorizationMode,
   params: ApiQueryParams = {},
): Promise<T> {
   return request<T>('GET', url, authorizationMode, { params });
}

export function postRequest<T = ApiResponse>(
   url: string,
   authorizationMode: AuthorizationMode,
   data: unknown,
): Promise<T> {
   return request<T>('POST', url, authorizationMode, {
      body: JSON.stringify(data),
      jsonBody: true,
   });
}

export function postFileRequest<T = ApiResponse>(
   url: string,
   authorizationMode: AuthorizationMode,
   data: FormData,
): Promise<T> {
   // Do not set Content-Type for FormData: the browser adds the multipart boundary.
   return request<T>('POST', url, authorizationMode, { body: data });
}

export function putRequest<T = ApiResponse>(
   url: string,
   authorizationMode: AuthorizationMode,
   data: unknown,
): Promise<T> {
   return request<T>('PUT', url, authorizationMode, {
      body: JSON.stringify(data),
      jsonBody: true,
   });
}

export function deleteRequest<T = ApiResponse>(
   url: string,
   authorizationMode: AuthorizationMode,
): Promise<T> {
   return request<T>('DELETE', url, authorizationMode);
}
