import { Injectable, inject, signal } from '@angular/core';
import { ApiResponse, ApiService } from '../http/api.service';
import { AuthService } from '../auth/auth.service';
import { JobSummary } from '../models/api.models';
import { AuthorizationMode } from 'src/app/service/constant';
@Injectable({ providedIn: 'root' })
export class SavedJobService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  readonly savedIds = signal<ReadonlySet<number>>(new Set());
  readonly pendingIds = signal<ReadonlySet<number>>(new Set());
  private loadedUserId: number | null = null;
  private loading?: Promise<void>;
  private loadingUserId: number | null = null;
  list(page = 1, pageSize = 9): Promise<ApiResponse<JobSummary[]>> {
    return this.api.getRequest('/api/candidate/saved-jobs', AuthorizationMode.BEARER_TOKEN, { page, pageSize });
  }
  async ensureLoaded(): Promise<void> {
    const userId = this.auth.currentUser()?.id;
    if (!this.auth.isRole('candidate') || !userId) { this.savedIds.set(new Set()); this.loadedUserId = null; return; }
    if (this.loadedUserId === userId) return;
    if (this.loading && this.loadingUserId === userId) return this.loading;
    this.savedIds.set(new Set());
    this.loadingUserId = userId;
    const loading = (async () => {
      const result = await this.api.getRequest<ApiResponse<number[]>>('/api/candidate/saved-jobs/ids', AuthorizationMode.BEARER_TOKEN);
      if (result.statusCode !== 200) throw new Error('Không thể tải việc làm đã lưu.');
      const ids = new Set(result.data ?? []);
      if (this.auth.currentUser()?.id === userId && this.auth.isRole('candidate')) { this.savedIds.set(ids); this.loadedUserId = userId; }
    })();
    this.loading = loading;
    try { await loading; } finally { if (this.loading === loading) { this.loading = undefined; this.loadingUserId = null; } }
  }
  async toggle(jobId: number): Promise<void> {
    if (!this.auth.isRole('candidate')) throw new Error('Vui lòng đăng nhập bằng tài khoản ứng viên.');
    const userId = this.auth.currentUser()?.id;
    await this.ensureLoaded();
    if (this.auth.currentUser()?.id !== userId || !this.auth.isRole('candidate')) throw new Error('Phiên đăng nhập đã thay đổi.');
    if (this.pendingIds().has(jobId)) return;
    const removing = this.savedIds().has(jobId);
    this.pendingIds.update(ids => new Set([...ids, jobId]));
    try {
      const response = removing
        ? await this.api.deleteRequest<ApiResponse<boolean>>(`/api/candidate/saved-jobs/${jobId}`, AuthorizationMode.BEARER_TOKEN)
        : await this.api.putRequest<ApiResponse<boolean>>(`/api/candidate/saved-jobs/${jobId}`, AuthorizationMode.BEARER_TOKEN, {});
      if (response.statusCode < 200 || response.statusCode >= 300) throw new Error('Không thể cập nhật việc làm đã lưu.');
      if (this.auth.currentUser()?.id === userId && this.auth.isRole('candidate')) this.savedIds.update(ids => { const updated = new Set(ids); if (removing) updated.delete(jobId); else updated.add(jobId); return updated; });
    } finally { this.pendingIds.update(ids => { const updated = new Set(ids); updated.delete(jobId); return updated; }); }
  }
}
