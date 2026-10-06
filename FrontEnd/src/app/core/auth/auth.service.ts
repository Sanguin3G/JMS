import { Injectable, computed, signal, inject } from '@angular/core';
import { ApiService } from '../http/api.service';
import { UserProfile } from '../models/api.models';
import { AuthorizationMode, apiAdmin, apiCandidate, apiRecruiter } from 'src/app/service/constant';


export type UserRole = 'candidate' | 'recruiter' | 'admin';
const endpoints = {
  candidate: [apiCandidate.LOGIN_CANDIDATE, apiCandidate.GET_PROFILE_USER],
  recruiter: [apiRecruiter.LOGIN_RECRUITER, apiRecruiter.GET_PROFILE_RECRUITER],
  admin: [apiAdmin.LOGIN_ADMIN, apiAdmin.GET_ADMIN_PROFILE],
};

export function tokenRole(token: string | null): UserRole | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp || payload.exp * 1000 <= Date.now()) return null;
    const rawRole = String(payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? payload.role).toLowerCase();
    const role = rawRole === 'recuirter' ? 'recruiter' : rawRole;
    return ['candidate', 'recruiter', 'admin'].includes(role) ? role as UserRole : null;
  } catch { return null; }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  readonly currentUser = signal<UserProfile | null>(this.readProfile());
  readonly role = signal<UserRole | null>(tokenRole(this.getToken()));
  readonly authenticated = computed(() => this.role() !== null && this.currentUser() !== null);
  private readProfile(): UserProfile | null {
    try { return JSON.parse(localStorage.getItem('profile') ?? 'null'); } catch { return null; }
  }
  async signIn(role: UserRole, username: string, password: string): Promise<UserProfile> {
    const result = await this.api.postRequest(endpoints[role][0], AuthorizationMode.PUBLIC, { username, password });
    if (result.statusCode !== 200 || typeof result.data !== 'string') throw new Error(result.message ?? 'Tên đăng nhập hoặc mật khẩu không chính xác.');
    this.signOut();
    localStorage.setItem('token', result.data);
    try {
      const profile = await this.api.postRequest<{ statusCode: number; data?: UserProfile }>(endpoints[role][1], AuthorizationMode.BEARER_TOKEN, {});
      if (profile.statusCode !== 200 || !profile.data) throw new Error('Không thể tải thông tin tài khoản.');
      localStorage.setItem('profile', JSON.stringify(profile.data));
      this.currentUser.set(profile.data);
      this.role.set(role);
      return profile.data;
    } catch (error) { this.signOut(); throw error; }
  }
  getProfile(): UserProfile | null { return this.currentUser(); }
  getToken(): string | null { try { return localStorage.getItem('token'); } catch { return null; } }
  isLogin(): boolean { return this.authenticated() && tokenRole(this.getToken()) !== null; }
  isRole(role: UserRole): boolean { return tokenRole(this.getToken()) === role; }
  updateProfile(profile: UserProfile): void {
    localStorage.setItem('profile', JSON.stringify(profile));
    this.currentUser.set(profile);
  }
  signOut(): void {
    for (const key of ['token', 'profile', 'candidate-token', 'recruiter-token', 'admin-token', 'admin-profile']) localStorage.removeItem(key);
    this.currentUser.set(null);
    this.role.set(null);
  }
}
