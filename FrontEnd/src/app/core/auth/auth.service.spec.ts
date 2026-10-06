import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService, tokenRole } from './auth.service';
import { bearerInterceptor } from '../http/api.service';

const token = (role: string, expires = Date.now() / 1000 + 3600) => `header.${btoa(JSON.stringify({ role, exp: expires }))}.signature`;
describe('JMS session', () => {
  let auth: AuthService;
  let http: HttpTestingController;
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptors([bearerInterceptor])), provideHttpClientTesting()] });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('waits for the profile before exposing an authenticated session', async () => {
    const jwt = token('Candidate');
    const promise = auth.signIn('candidate', 'an.le', 'example');
    http.expectOne(req => req.url.endsWith('/login-candidate')).flush({ statusCode: 200, data: jwt });
    await Promise.resolve();
    expect(auth.authenticated()).toBe(false);
    const profileRequest = http.expectOne(req => req.url.endsWith('/get-data-candidate'));
    expect(profileRequest.request.headers.get('Authorization')).toBe(`Bearer ${jwt}`);
    profileRequest.flush({ statusCode: 200, data: { id: 7, fullName: 'An Le' } });
    await promise;
    expect(auth.currentUser()?.id).toBe(7);
    expect(auth.isRole('candidate')).toBe(true);
    expect(auth.isRole('admin')).toBe(false);
  });
  it('clears a partial session when profile loading fails without erasing theme preferences', async () => {
    localStorage.setItem('jms-theme-mode', 'dark');
    const promise = auth.signIn('recruiter', 'minh.northstar', 'example');
    const rejection = expect(promise).rejects.toBeInstanceOf(Error);
    http.expectOne(req => req.url.endsWith('/login-recuirter')).flush({ statusCode: 200, data: token('Recuirter') });
    await Promise.resolve();
    http.expectOne(req => req.url.endsWith('/get-data-recruiter')).flush({}, { status: 500, statusText: 'Server Error' });
    await rejection;
    expect(auth.getToken()).toBeNull();
    expect(auth.currentUser()).toBeNull();
    expect(localStorage.getItem('jms-theme-mode')).toBe('dark');
  });
  it('rejects expired and malformed tokens and recognizes the historical recruiter claim', () => {
    expect(tokenRole(token('Candidate', 1))).toBeNull();
    expect(tokenRole('broken')).toBeNull();
    expect(tokenRole(token('Recuirter'))).toBe('recruiter');
  });
});
