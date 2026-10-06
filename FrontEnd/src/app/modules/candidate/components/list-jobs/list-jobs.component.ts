import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { JobService, JobSearch } from 'src/app/core/jobs/job.service';
import { SavedJobService } from 'src/app/core/jobs/saved-job.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { NotificationService } from 'src/app/core/notifications/notification.service';
import { CatalogItem, JobSummary } from 'src/app/core/models/api.models';
@Component({ standalone: false, selector: 'app-list-jobs', templateUrl: './list-jobs.component.html', styleUrls: ['./list-jobs.component.css'] })
export class ListJobsComponent implements OnInit {
  private readonly jobs = inject(JobService);
  readonly savedJobs = inject(SavedJobService);
  readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  filters: JobSearch = { page: 1, pageSize: 9, query: '', location: '', categoryId: null, employmentTypeId: null, levelId: null, sort: 'newest' };
  categories: CatalogItem[] = []; employmentTypes: CatalogItem[] = [];
  listJds: JobSummary[] = []; totalItems = 0; isLoading = true; errorMessage = '';
  private loadVersion = 0;
  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.filters = { page: Math.max(1, Number(params.get('page')) || 1), pageSize: 9, query: params.get('query') ?? '', location: params.get('location') ?? '', categoryId: Number(params.get('categoryId')) || null, employmentTypeId: Number(params.get('employmentTypeId')) || null, levelId: null, sort: params.get('sort') === 'oldest' ? 'oldest' : 'newest' };
      void this.loadJobs();
    });
    void this.jobs.categories().then(result => this.categories = result.data ?? []).catch(() => {});
    void this.jobs.employmentTypes().then(result => this.employmentTypes = result.data ?? []).catch(() => {});
    void this.savedJobs.ensureLoaded().catch(() => this.notifications.info('Chưa tải được trạng thái việc làm đã lưu.'));
  }
  async loadJobs(): Promise<void> {
    const version = ++this.loadVersion;
    this.isLoading = true; this.errorMessage = '';
    try {
      const response = await this.jobs.search(this.filters);
      if (response.statusCode !== 200) throw new Error('Jobs unavailable');
      if (version !== this.loadVersion) return;
      this.listJds = response.data ?? []; this.totalItems = response.objectLength ?? 0;
    } catch {
      if (version !== this.loadVersion) return;
      this.errorMessage = 'Không thể tải việc làm. Vui lòng thử lại.'; this.listJds = [];
    } finally { if (version === this.loadVersion) this.isLoading = false; }
  }
  search(page = 1): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: { page: page > 1 ? page : null, query: this.filters.query.trim() || null, location: this.filters.location.trim() || null, categoryId: this.filters.categoryId, employmentTypeId: this.filters.employmentTypeId, sort: this.filters.sort === 'newest' ? null : this.filters.sort } });
  }
  clearFilters(): void { void this.router.navigate([], { relativeTo: this.route, queryParams: {} }); }
  async toggleSave(jobId: number): Promise<void> {
    try { await this.savedJobs.toggle(jobId); }
    catch { this.notifications.error('Không thể cập nhật việc làm đã lưu. Vui lòng thử lại.'); }
  }
  catalogName(item: CatalogItem): string { return item.categoryName || item.title || item.name || ''; }
}
