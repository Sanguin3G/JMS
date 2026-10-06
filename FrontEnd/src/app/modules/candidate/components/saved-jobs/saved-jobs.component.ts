import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SavedJobService } from 'src/app/core/jobs/saved-job.service';
import { NotificationService } from 'src/app/core/notifications/notification.service';
import { JobSummary } from 'src/app/core/models/api.models';
@Component({ standalone: false, selector: 'app-saved-jobs', templateUrl: './saved-jobs.component.html', styleUrls: ['./saved-jobs.component.css'] })
export class SavedJobsComponent implements OnInit {
  readonly savedJobs = inject(SavedJobService);
  private readonly notifications = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  jobs: JobSummary[] = []; page = 1; readonly pageSize = 9; total = 0; loading = true; error = '';
  private version = 0;
  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => { this.page = Math.max(1, Number(params.get('page')) || 1); void this.load(); });
    void this.savedJobs.ensureLoaded().catch(() => this.notifications.info('Chưa tải được trạng thái việc làm đã lưu.'));
  }
  async load(): Promise<void> {
    const version = ++this.version; this.loading = true; this.error = '';
    try {
      const response = await this.savedJobs.list(this.page, this.pageSize);
      if (response.statusCode !== 200) throw new Error('Saved jobs unavailable');
      if (version !== this.version) return;
      this.jobs = response.data ?? []; this.total = response.objectLength ?? 0;
      if (!this.jobs.length && this.page > 1 && this.total > 0) this.changePage(Math.max(1, Math.ceil(this.total / this.pageSize)));
    } catch { if (version === this.version) this.error = 'Không thể tải việc làm đã lưu. Vui lòng thử lại.'; }
    finally { if (version === this.version) this.loading = false; }
  }
  changePage(page: number): void { void this.router.navigate([], { relativeTo: this.route, queryParams: { page: page > 1 ? page : null } }); }
  async unsave(jobId: number): Promise<void> {
    try { await this.savedJobs.toggle(jobId); this.notifications.success('Đã bỏ lưu việc làm.'); await this.load(); }
    catch { this.notifications.error('Không thể bỏ lưu việc làm. Vui lòng thử lại.'); }
  }
}
