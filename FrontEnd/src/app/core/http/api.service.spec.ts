import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ApiService, bearerInterceptor, ApiRequestError } from './api.service';
import { AuthService } from '../auth/auth.service';
import { AuthorizationMode } from 'src/app/service/constant';

describe('API transport', () => {
  let api: ApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptors([bearerInterceptor])), provideHttpClientTesting()] });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('encodes query values and only attaches a token to authenticated requests', async () => {
    localStorage.setItem('token', 'test-token');
    const publicCall = api.getRequest('/api/jobs/search', AuthorizationMode.PUBLIC, { query: 'C++ & Angular', empty: null, page: 2 });
    const request = http.expectOne(req => req.url.endsWith('/api/jobs/search'));
    expect(request.request.params.get('query')).toBe('C++ & Angular');
    expect(request.request.params.has('empty')).toBe(false);
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({ statusCode: 200, data: [] });
    await publicCall;
    const privateCall = api.getRequest('/api/private', AuthorizationMode.BEARER_TOKEN);
    const privateRequest = http.expectOne(req => req.url.endsWith('/api/private'));
    expect(privateRequest.request.headers.get('Authorization')).toBe('Bearer test-token');
    privateRequest.flush({ statusCode: 200 });
    await privateCall;
  });
  it('preserves multipart boundaries and gives callers a structured failure', async () => {
    const form = new FormData();
    form.append('file', new Blob(['example']), 'example.png');
    const promise = api.postFileRequest('/api/upload', AuthorizationMode.BEARER_TOKEN, form);
    const rejection = expect(promise).rejects.toMatchObject({ status: 413, message: 'File too large' });
    const request = http.expectOne(req => req.url.endsWith('/api/upload'));
    expect(request.request.body).toBe(form);
    expect(request.request.headers.has('Content-Type')).toBe(false);
    request.flush({ message: 'File too large' }, { status: 413, statusText: 'Payload Too Large' });
    await rejection;
  });
});
