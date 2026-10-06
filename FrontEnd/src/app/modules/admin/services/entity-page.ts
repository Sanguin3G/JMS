import { DestroyRef, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiResponse, ApiService } from 'src/app/core/http/api.service';
import { AuthorizationMode } from 'src/app/service/constant';

export type EntityStatus = 'all' | 'active' | 'inactive';
export interface AdminAccount { id: number; fullName: string; userName: string; email: string; phoneNumber?: string; isActive: boolean; companyId?: number; companyName?: string; }
export interface AdminCompany { companyId: number; companyName: string; address?: string; email?: string; categoryName?: string; dateCreatedDisplay?: string; recuirterFounder?: string; isDelete: boolean; }

/** Small state owner shared by the three management pages; each page owns its presentation/actions. */
export class EntityPage<T> {
  readonly rows = signal<T[]>([]); readonly loading = signal(false); readonly error = signal('');
  query = ''; status: EntityStatus = 'all'; page = 1; total = 0; totalPages = 0; readonly pageSize = 10;
  private requestId = 0;
  constructor(private readonly entity: 'companies' | 'candidates' | 'recruiters', private readonly api: ApiService,
    private readonly router: Router, private readonly route: ActivatedRoute, destroyRef: DestroyRef) {
    this.route.queryParamMap.pipe(takeUntilDestroyed(destroyRef)).subscribe(params => {
      this.query = (params.get('query') || '').slice(0, 120);
      const status = params.get('status'); this.status = status === 'active' || status === 'inactive' ? status : 'all';
      this.page = Math.max(1, Number.parseInt(params.get('page') || '1', 10) || 1); void this.load();
    });
  }
  async load(): Promise<void> {
    const id = ++this.requestId; this.loading.set(true); this.error.set('');
    try {
      const response = await this.api.getRequest<ApiResponse<T[]>>(`/api/admin/entities/${this.entity}`, AuthorizationMode.BEARER_TOKEN,
        { page: this.page, pageSize: this.pageSize, query: this.query, status: this.status });
      if (id !== this.requestId) return;
      if (response.statusCode !== 200) throw new Error(response.message || 'Không thể tải dữ liệu.');
      this.rows.set(response.data || []); this.total = response.objectLength; this.totalPages = response.totalPage;
      this.page = response['currentPage'] || 1;
    } catch (error) { if (id === this.requestId) this.error.set(error instanceof Error ? error.message : 'Không thể tải dữ liệu.'); }
    finally { if (id === this.requestId) this.loading.set(false); }
  }
  navigate(page = 1): void { void this.router.navigate([], { relativeTo: this.route, queryParams: {
    query: this.query.trim() || null, status: this.status === 'all' ? null : this.status, page: page > 1 ? page : null } }); }
  clear(): void { this.query = ''; this.status = 'all'; this.navigate(); }
}
