import { Component, DestroyRef, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService, ApiResponse } from 'src/app/core/http/api.service';
import { AuthorizationMode, apiCandidate } from 'src/app/service/constant';
import { NotificationService } from 'src/app/core/notifications/notification.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { SavedJobService } from 'src/app/core/jobs/saved-job.service';
import { CurriculumVitae, JobDetail } from 'src/app/core/models/api.models';
@Component({ standalone: false, selector: 'app-jd-detail', templateUrl: './jd-detail.component.html', styleUrls: ['./jd-detail.component.css'] })
export class JdDetailComponent implements OnInit {
  readonly auth = inject(AuthService); readonly savedJobs = inject(SavedJobService);
  private readonly api = inject(ApiService); private readonly route = inject(ActivatedRoute);
  private readonly notifications = inject(NotificationService); private readonly destroyRef = inject(DestroyRef);
  jd: JobDetail | null = null; listCvs: CurriculumVitae[] = []; selectedCV = 0;
  loading = true; error = ''; cvLoading = false; cvError = ''; pending = false; applied = false; isApplyModalOpen = false;
  private jobId = 0; private version = 0;
  @ViewChild('cvSelect') private cvSelect?: ElementRef<HTMLSelectElement>;
  @ViewChild('applyButton') private applyButton?: ElementRef<HTMLButtonElement>;
  get isCandidate(): boolean { return this.auth.isRole('candidate'); }
  get isExpired(): boolean { return this.jd?.isExpired ?? false; }
  get details(): { title: string; content: string }[] {
    return [
      { title: 'Mô tả công việc', content: this.jd?.jobDetail ?? '' }, { title: 'Kỹ năng cần có', content: this.jd?.skillRequirement ?? '' },
      { title: 'Kinh nghiệm', content: this.jd?.experienceRequirement ?? '' }, { title: 'Học vấn', content: this.jd?.educationRequirement ?? '' },
      { title: 'Chứng chỉ', content: this.jd?.certificateRequirement ?? '' }, { title: 'Dự án', content: this.jd?.projectRequirement ?? '' },
      { title: 'Quyền lợi', content: this.jd?.candidateBenefit ?? '' }, { title: 'Thông tin khác', content: this.jd?.otherInformation ?? '' }
    ].filter(section => section.content.trim());
  }
  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => { this.jobId = Number(params.get('id')); this.applied = false; this.isApplyModalOpen = false; void this.loadJob(); });
    void this.savedJobs.ensureLoaded().catch(() => this.notifications.info('Chưa tải được trạng thái việc làm đã lưu.'));
    if (this.isCandidate) void this.loadCvs();
  }
  async loadJob(): Promise<void> {
    const version = ++this.version; this.loading = true; this.error = '';
    try {
      const response = await this.api.getRequest<ApiResponse<JobDetail>>(apiCandidate.GET_JD_BY_ID, AuthorizationMode.PUBLIC, { jdId: this.jobId });
      if (response.statusCode !== 200 || !response.data) throw new Error('Job unavailable');
      if (version === this.version) this.jd = response.data;
    } catch { if (version === this.version) { this.error = 'Không tìm thấy công việc hoặc chưa thể tải thông tin. Vui lòng thử lại.'; this.jd = null; } }
    finally { if (version === this.version) this.loading = false; }
  }
  async loadCvs(): Promise<void> {
    const candidateId = this.auth.currentUser()?.id; if (!candidateId) return;
    this.cvLoading = true; this.cvError = '';
    try {
      const response = await this.api.getRequest<ApiResponse<CurriculumVitae[]>>(`${apiCandidate.GET_ALL_CV_BY_ID}/${candidateId}`, AuthorizationMode.BEARER_TOKEN);
      if (response.statusCode !== 200) throw new Error('CV unavailable');
      this.listCvs = response.data ?? [];
    } catch { this.cvError = 'Không thể tải danh sách CV.'; }
    finally { this.cvLoading = false; }
  }
  openApplyModal(): void {
    if (!this.isCandidate || this.isExpired || this.applied) return;
    this.isApplyModalOpen = true;
    requestAnimationFrame(() => this.cvSelect?.nativeElement.focus());
  }
  closeApplyModal(): void { if (!this.pending) { this.isApplyModalOpen = false; this.applyButton?.nativeElement.focus(); } }
  async submitCv(): Promise<void> {
    const candidateId = this.auth.currentUser()?.id;
    if (this.pending || !this.isCandidate || !candidateId || !this.selectedCV || !this.jd || this.isExpired) return;
    this.pending = true;
    try {
      const response = await this.api.postRequest(`${apiCandidate.CANDIDATE_APPLYJOB}?candidateId=${candidateId}&CVid=${this.selectedCV}&jobDescriptionId=${this.jd.jobId}`, AuthorizationMode.BEARER_TOKEN, {});
      if (response.statusCode === 200 || response.statusCode === 204) {
        this.applied = true; this.isApplyModalOpen = false;
        this.notifications.success(response.statusCode === 204 ? 'Bạn đã ứng tuyển công việc này.' : 'Đã gửi hồ sơ. Nhà tuyển dụng sẽ xem xét ứng tuyển của bạn.');
        this.applyButton?.nativeElement.focus();
      } else this.notifications.error('Không thể gửi hồ sơ. Vui lòng thử lại.');
    } catch { this.notifications.error('Không thể gửi hồ sơ. Vui lòng thử lại.'); }
    finally { this.pending = false; }
  }
  async toggleSave(): Promise<void> { if (!this.jd) return; try { await this.savedJobs.toggle(this.jd.jobId); } catch { this.notifications.error('Không thể cập nhật việc làm đã lưu.'); } }
  imageError(event: Event): void { const image = event.target as HTMLImageElement; if (!image.src.endsWith('/assets/images/avatar.svg')) image.src = '/assets/images/avatar.svg'; }
}
