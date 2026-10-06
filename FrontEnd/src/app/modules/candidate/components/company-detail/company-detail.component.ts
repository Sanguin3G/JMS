import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService, ApiResponse } from 'src/app/core/http/api.service';
import { AuthorizationMode, apiRecruiter } from 'src/app/service/constant';
import { CompanySummary, JobSummary } from 'src/app/core/models/api.models';
interface CompanyProfile extends CompanySummary { jDs?: JobSummary[]; address?: string; categoryName?: string; }
@Component({ standalone: false, selector: 'app-company-detail', templateUrl: './company-detail.component.html', styleUrls: ['./company-detail.component.css'] })
export class CompanyDetailComponent implements OnInit {
  private readonly api = inject(ApiService); private readonly route = inject(ActivatedRoute); private readonly destroyRef = inject(DestroyRef);
  company: CompanyProfile | null = null; jobs: JobSummary[] = []; loading = true; error = ''; private companyId = 0; private version = 0;
  ngOnInit(): void { this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => { this.companyId = Number(params.get('id')); void this.load(); }); }
  async load(): Promise<void> {
    const version = ++this.version; this.loading = true; this.error = '';
    try { const response = await this.api.getRequest<ApiResponse<CompanyProfile>>(`${apiRecruiter.GET_COMPANY_BY_ID}/${this.companyId}`, AuthorizationMode.PUBLIC); if (response.statusCode !== 200 || !response.data) throw new Error('Company unavailable'); if (version === this.version) { this.company = response.data; this.jobs = (response.data.jDs ?? []).filter(job => !job.isExpired); } }
    catch { if (version === this.version) this.error = 'Không tìm thấy công ty hoặc chưa thể tải thông tin. Vui lòng thử lại.'; }
    finally { if (version === this.version) this.loading = false; }
  }
  get website(): string | null { try { const url = new URL(this.company?.webURL ?? ''); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; } catch { return null; } }
  imageError(event: Event): void { const image = event.target as HTMLImageElement; if (!image.src.endsWith('/assets/images/avatar.svg')) image.src = '/assets/images/avatar.svg'; }
}
