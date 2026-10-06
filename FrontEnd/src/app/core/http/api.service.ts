import { AuthService } from '../auth/auth.service';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpContextToken, HttpErrorResponse, HttpInterceptorFn, HttpParams } from '@angular/common/http';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthorizationMode } from 'src/app/service/constant';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  statusCode: number;
  objectLength: number;
  totalPage: number;
  [key: string]: any;
}
export type ApiQueryParams = Record<string, string | number | boolean | null | undefined>;
export const AUTHENTICATED_REQUEST = new HttpContextToken<boolean>(() => false);

export class ApiRequestError extends Error {
  constructor(public readonly status: number, public readonly url: string, public readonly response?: ApiResponse) {
    super(response?.message || 'Không thể hoàn tất yêu cầu. Vui lòng thử lại.');
  }
}

export const bearerInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthService).getToken();
  if (request.context.get(AUTHENTICATED_REQUEST) && token) {
    request = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(request).pipe(catchError((error: HttpErrorResponse) =>
    throwError(() => new ApiRequestError(error.status, error.url ?? request.url, error.error))));
};

/** Single transport for the existing controller envelope, including multipart uploads. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private request<T>(method: string, path: string, mode: AuthorizationMode, body?: unknown, query: ApiQueryParams = {}): Promise<T> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) params = params.set(key, String(value));
    }
    return firstValueFrom(this.http.request<T>(method, `${environment.apiUrl}${path}`, {
      body, params, context: new HttpContext().set(AUTHENTICATED_REQUEST, mode === AuthorizationMode.BEARER_TOKEN),
    }));
  }
  getRequest<T = ApiResponse>(path: string, mode: AuthorizationMode, params: ApiQueryParams = {}): Promise<T> {
    return this.request<T>('GET', path, mode, undefined, params);
  }
  postRequest<T = ApiResponse>(path: string, mode: AuthorizationMode, body: unknown): Promise<T> {
    return this.request<T>('POST', path, mode, body);
  }
  postFileRequest<T = ApiResponse>(path: string, mode: AuthorizationMode, body: FormData): Promise<T> {
    return this.request<T>('POST', path, mode, body);
  }
  putRequest<T = ApiResponse>(path: string, mode: AuthorizationMode, body: unknown): Promise<T> {
    return this.request<T>('PUT', path, mode, body);
  }
  deleteRequest<T = ApiResponse>(path: string, mode: AuthorizationMode): Promise<T> {
    return this.request<T>('DELETE', path, mode);
  }
}
