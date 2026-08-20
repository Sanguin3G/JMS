import { ADMIN_TOKEN, CANDIDATE_TOKEN, RECRUITER_TOKEN } from './constant';
import { convertPayloadToQueryString, getStoredAccessToken } from './api-requests';

describe('api request helpers', () => {
   beforeEach(() => localStorage.clear());

   it('prefers the current generic token', () => {
      localStorage.setItem('token', 'current-token');
      localStorage.setItem(CANDIDATE_TOKEN, 'candidate-token');

      expect(getStoredAccessToken()).toBe('current-token');
   });

   it('falls back to role-specific sessions from before the shared API layer', () => {
      localStorage.setItem(RECRUITER_TOKEN, 'recruiter-token');

      expect(getStoredAccessToken()).toBe('recruiter-token');
   });

   it('supports admin sessions and omits empty query values', () => {
      localStorage.setItem(ADMIN_TOKEN, 'admin-token');

      expect(getStoredAccessToken()).toBe('admin-token');
      expect(convertPayloadToQueryString({ page: 2, search: null, enabled: false })).toBe('page=2&enabled=false');
   });
});
