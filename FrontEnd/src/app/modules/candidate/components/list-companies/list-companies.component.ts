import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService, ApiResponse } from 'src/app/core/http/api.service';
import { AuthorizationMode, apiRecruiter } from 'src/app/service/constant';
import { CompanySummary } from 'src/app/core/models/api.models';
interface CompanyCard extends CompanySummary { categoryName?: string; address?: string; }
@Component({ standalone: false, selector: 'app-list-companies', templateUrl: './list-companies.component.html', styleUrls: ['./list-companies.component.css'] })
export class CandidateListCompaniesComponent implements OnInit {
  private readonly api = inject(ApiService); private readonly router = inject(Router); private readonly route = inject(ActivatedRoute); private readonly destroyRef = inject(DestroyRef);
  companies: CompanyCard[] = []; page = 1; readonly itemsPerPage = 9; totalItems = 0; totalPages = 0; inputSearch = ''; loading = true; error = ''; private version = 0;
  ngOnInit(): void { this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => { this.page = Math.max(1, Number(params.get('page')) || 1); this.inputSearch = params.get('query') ?? ''; void this.load(); }); }
  async load(): Promise<void> {
    const version = ++this.version; this.loading = true; this.error = '';
    try {
      const query = this.inputSearch.trim();
      const response = await this.api.getRequest<ApiResponse<CompanyCard[]>>(query ? apiRecruiter.SEARCH_COMPANY : apiRecruiter.GET_COMPANY_PAGING, AuthorizationMode.PUBLIC, { page: this.page, search: query || undefined });
      if (response.statusCode !== 200) throw new Error('Companies unavailable');
      if (version !== this.version) return;
      this.companies = response.data ?? []; this.totalItems = response.objectLength ?? 0; this.totalPages = response.totalPage ?? 0; this.page = Number(response['currentPage']) || 1;
    } catch { if (version === this.version) this.error = 'Không thể tải danh sách công ty. Vui lòng thử lại.'; }
    finally { if (version === this.version) this.loading = false; }
  }
  search(page = 1): void { void this.router.navigate([], { relativeTo: this.route, queryParams: { query: this.inputSearch.trim() || null, page: page > 1 ? page : null } }); }
  clear(): void { this.inputSearch = ''; this.search(); }
  imageError(event: Event): void { const image = event.target as HTMLImageElement; if (!image.src.endsWith('/assets/images/avatar.svg')) image.src = '/assets/images/avatar.svg'; }
}
