import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Dialog } from '@angular/cdk/dialog';
import { ListCandidateComponent } from '../list-candidate/list-candidate.component';
import { ApiService, ApiResponse } from 'src/app/core/http/api.service';
import { NotificationService } from 'src/app/core/notifications/notification.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { AuthorizationMode, apiRecruiter } from 'src/app/service/constant';
import { JobDetail, MatchingRecord } from 'src/app/core/models/api.models';

@Component({ standalone: false, selector: 'app-jd-detail', templateUrl: './jd-detail.component.html', styleUrls: ['./jd-detail.component.css'] })
export class JdDetailComponent {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(Dialog);
  private readonly notices = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  jdDetail: JobDetail | null = null;
  loadError = '';
  isMatching = false;
  reviewLoading = false;
  private version = 0;
  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => void this.load(Number(params.get('id'))));
  }
  async load(id: number): Promise<void> {
    const version = ++this.version;
    this.jdDetail = null; this.loadError = '';
    try {
      const response = await this.api.getRequest<ApiResponse<JobDetail>>(
        apiRecruiter.GET_JD_BY_RECRUITER + '/' + this.auth.currentUser()?.id + '/' + id, AuthorizationMode.BEARER_TOKEN);
      if (response.statusCode !== 200 || !response.data) throw new Error('Job unavailable');
      if (version === this.version) this.jdDetail = response.data;
    } catch { if (version === this.version) this.loadError = 'Không thể tải tin tuyển dụng.'; }
  }
  async openMatchingDialog(): Promise<void> {
    if (this.isMatching || !this.jdDetail || this.jdDetail.isExpired) return;
    this.isMatching = true;
    try {
      const response = await this.api.postRequest<ApiResponse<MatchingRecord[]>>(apiRecruiter.MATCHING_JOB +
        '?recruiterId=' + this.auth.currentUser()?.id + '&jobDescriptionId=' + this.jdDetail.jobId, AuthorizationMode.BEARER_TOKEN, {});
      if (response.statusCode !== 200) throw new Error('Matching unavailable');
      this.notices.success('Đã đối chiếu ' + (response.data?.length ?? 0) + ' hồ sơ. Xem bằng chứng trong danh sách ứng viên.');
    } catch { this.notices.error('Không thể đối chiếu hồ sơ. Vui lòng thử lại.'); }
    finally { this.isMatching = false; }
  }
  async openCandidateDialog(type: number): Promise<void> {
    if (!this.jdDetail || this.reviewLoading) return;
    this.reviewLoading = true;
    try {
      // Fetch the same review collection, retaining selected records for status visibility.
      const response = await this.api.getRequest<ApiResponse<MatchingRecord[]>>(apiRecruiter.GET_CV_MATCHED_LEFT,
        AuthorizationMode.BEARER_TOKEN, { recruiterId: this.auth.currentUser()?.id, jobDescriptionId: this.jdDetail.jobId });
      if (response.statusCode !== 200) throw new Error('Review unavailable');
      const content = type === 2 ? (response.data ?? []).filter(item => item.isSelected) : response.data ?? [];
      this.dialog.open(ListCandidateComponent, { width: '900px', maxWidth: '96vw', maxHeight: '95vh',
        ariaLabel: 'Danh sách ứng viên', data: { listType: type, recruiterId: this.auth.currentUser()?.id, jdId: this.jdDetail.jobId, content } });
    } catch { this.notices.error('Không thể tải hồ sơ ứng viên. Vui lòng thử lại.'); }
    finally { this.reviewLoading = false; }
  }
}
