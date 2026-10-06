import { Component, OnInit, inject } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { firstValueFrom } from 'rxjs';
import { ApiService, ApiResponse } from 'src/app/core/http/api.service';
import { AuthorizationMode, apiCandidate } from 'src/app/service/constant';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from 'src/app/core/notifications/notification.service';
import { CurriculumVitae } from 'src/app/core/models/api.models';
interface LibraryCv extends CurriculumVitae { isFindingJob?: boolean; lastUpdateDateDisplay?: string; }
@Component({ standalone: false, selector: 'app-my-cvs', templateUrl: './my-cvs.component.html', styleUrls: ['./my-cvs.component.css'] })
export class CandidateMyCvsComponent implements OnInit {
  private readonly auth = inject(AuthService); private readonly api = inject(ApiService); private readonly dialog = inject(Dialog); private readonly notifications = inject(NotificationService);
  readonly themes = [0,1,2,3,4,5,6,7,8]; listCVs: LibraryCv[] = []; loading = true; error = ''; pendingId: number | null = null;
  ngOnInit(): void { void this.load(); }
  async load(): Promise<void> {
    const userId = this.auth.currentUser()?.id; if (!userId) return;
    this.loading = true; this.error = '';
    try { const response = await this.api.getRequest<ApiResponse<LibraryCv[]>>(`${apiCandidate.GET_ALL_CV_BY_ID}/${userId}`, AuthorizationMode.BEARER_TOKEN); if (response.statusCode !== 200) throw new Error('CV unavailable'); this.listCVs = response.data ?? []; }
    catch { this.error = 'Không thể tải thư viện CV. Vui lòng thử lại.'; }
    finally { this.loading = false; }
  }
  async deleteCv(cv: LibraryCv): Promise<void> {
    if (this.pendingId !== null) return;
    const confirmed = await firstValueFrom(this.dialog.open<boolean>(ConfirmDialogComponent, { ariaLabelledBy: "confirm-title", ariaDescribedBy: "confirm-message", width: '420px', maxWidth: '95vw', data: { title: 'Xóa CV?', content: `Xóa “${cv.cvTitle || 'CV'}” khỏi thư viện? Hồ sơ đã gửi ứng tuyển vẫn được giữ lại.` } }).closed);
    if (!confirmed) return;
    const userId = this.auth.currentUser()?.id; if (!userId) return;
    this.pendingId = cv.id;
    try { const response = await this.api.postRequest(`${apiCandidate.DELETE_CV_BY_ID}?candidateId=${userId}&cvId=${cv.id}`, AuthorizationMode.BEARER_TOKEN, {}); if (response.statusCode !== 200) throw new Error('Delete failed'); this.listCVs = this.listCVs.filter(item => item.id !== cv.id); this.notifications.success('Đã xóa CV.'); }
    catch { this.notifications.error('Không thể xóa CV. Vui lòng thử lại.'); }
    finally { this.pendingId = null; }
  }
  async setFindingJob(cv: LibraryCv): Promise<void> {
    const userId = this.auth.currentUser()?.id; if (this.pendingId !== null || !userId) return;
    this.pendingId = cv.id;
    try { const response = await this.api.postRequest(`${apiCandidate.CHANGE_FINDING_JOB_STATUS}?candidateId=${userId}&cvId=${cv.id}`, AuthorizationMode.BEARER_TOKEN, {}); if (response.statusCode !== 200) throw new Error('Update failed'); await this.load(); this.notifications.success('Đã cập nhật hồ sơ tìm việc.'); }
    catch { this.notifications.error('Không thể cập nhật trạng thái CV.'); }
    finally { this.pendingId = null; }
  }
  themeIndex(cv: LibraryCv): number { return Math.max(0, Math.min(8, cv.theme ?? 6)); }
}
