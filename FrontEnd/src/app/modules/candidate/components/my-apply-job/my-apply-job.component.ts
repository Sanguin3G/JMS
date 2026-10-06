import { parseMatchingExplanation } from 'src/app/core/jobs/matching-explanation';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService, ApiResponse } from 'src/app/core/http/api.service';
import { AuthorizationMode, apiCandidate } from 'src/app/service/constant';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ViewCvComponent } from 'src/app/shared/cv-viewer/view-cv.component';
import { ApplicationRecord, MatchingExplanation } from 'src/app/core/models/api.models';
interface ApplicationDisplay extends ApplicationRecord { applyDate?: string; }
@Component({ standalone: false, selector: 'app-my-apply-job', templateUrl: './my-apply-job.component.html', styleUrls: ['./my-apply-job.component.css'] })
export class MyApplyJobComponent implements OnInit {
  private readonly auth = inject(AuthService); private readonly api = inject(ApiService); private readonly dialog = inject(Dialog);
  private readonly route = inject(ActivatedRoute); private readonly router = inject(Router); private readonly destroyRef = inject(DestroyRef);
  listJds: ApplicationDisplay[] = []; page = 1; readonly itemsPerPage = 9; totalItems = 0; totalPages = 0; loading = true; error = ''; private version = 0;
  ngOnInit(): void { this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => { this.page = Math.max(1, Number(params.get('page')) || 1); void this.loadApplications(); }); }
  async loadApplications(): Promise<void> {
    const candidateId = this.auth.currentUser()?.id; if (!candidateId) return;
    const version = ++this.version; this.loading = true; this.error = '';
    try {
      const response = await this.api.getRequest<ApiResponse<ApplicationDisplay[]>>(apiCandidate.GET_ALL_CV_APPLIED, AuthorizationMode.BEARER_TOKEN, { candidateId, pageIndex: this.page });
      if (response.statusCode !== 200) throw new Error('Applications unavailable');
      if (version !== this.version) return;
      this.totalItems = response.objectLength ?? 0; this.totalPages = response.totalPage ?? 0; this.page = Number(response['currentPage']) || 1;
      this.listJds = (response.data ?? []).map(application => ({ ...application, award: this.parseArray(application.award), certificate: this.parseArray(application.certificate), education: this.parseArray(application.education), jobExperience: this.parseArray(application.jobExperience), project: this.parseArray(application.project), skill: this.parseArray(application.skill), matchingInsight: parseMatchingExplanation(application.jsonMatching) }));
    } catch { if (version === this.version) this.error = 'Không thể tải danh sách ứng tuyển. Vui lòng thử lại.'; }
    finally { if (version === this.version) this.loading = false; }
  }
  pageChanged(page: number): void { void this.router.navigate([], { relativeTo: this.route, queryParams: { page: page > 1 ? page : null } }); }
  status(application: ApplicationDisplay): string { if (application.isReject) return 'Không được chọn'; if (application.isSelected) return 'Được chọn'; return 'Đã ứng tuyển'; }
  openViewCVDialog(application: ApplicationDisplay): void { this.dialog.open(ViewCvComponent, { width: '900px', maxWidth: '96vw', maxHeight: '95vh', data: { jd: application } }); }
  private parseArray(value: unknown): unknown[] { if (Array.isArray(value)) return value; if (typeof value !== 'string') return []; try { const parsed: unknown = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }

}
