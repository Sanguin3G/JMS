import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { firstValueFrom } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from 'src/app/core/notifications/notification.service';
import { JobStatusFilter, RecruiterJobItem, RecruiterWorkspaceService } from '../../services/recruiter-workspace.service';

@Component({ standalone: false, selector: 'app-list-jds', templateUrl: './list-jds.component.html', styleUrls: ['./list-jds.component.css'] })
export class ListJdsComponent implements OnInit {
  private readonly workspace = inject(RecruiterWorkspaceService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(Dialog);
  private readonly notices = inject(NotificationService);
  readonly jobs = signal<RecruiterJobItem[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly deleting = signal<number | null>(null);
  page = 1; total = 0; totalPages = 0; readonly pageSize = 9;
  query = ''; status: JobStatusFilter = 'all';
  private requestId = 0;
  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.query = (params.get('query') || '').slice(0, 120);
      const status = params.get('status');
      this.status = status === 'active' || status === 'expired' ? status : 'all';
      this.page = Math.max(1, Number.parseInt(params.get('page') || '1', 10) || 1);
      void this.load();
    });
  }
  async load(): Promise<void> {
    const requestId = ++this.requestId;
    this.loading.set(true); this.error.set('');
    try {
      const response = await this.workspace.jobs(this.page, this.query, this.status);
      if (requestId !== this.requestId) return;
      if (response.statusCode !== 200) throw new Error(response.message || 'Không thể tải tin tuyển dụng.');
      this.jobs.set(response.data || []); this.total = response.objectLength; this.totalPages = response.totalPage;
      this.page = response['currentPage'] || 1;
    } catch (error) {
      if (requestId === this.requestId) this.error.set(error instanceof Error ? error.message : 'Không thể tải tin tuyển dụng.');
    } finally { if (requestId === this.requestId) this.loading.set(false); }
  }
  filter(): void { this.navigate(1); }
  navigate(page: number): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: { query: this.query.trim() || null,
      status: this.status === 'all' ? null : this.status, page: page > 1 ? page : null } });
  }
  clear(): void { this.query = ''; this.status = 'all'; this.navigate(1); }
  async remove(item: RecruiterJobItem): Promise<void> {
    if (this.deleting() !== null) return;
    const confirmed = await firstValueFrom(this.dialog.open<boolean>(ConfirmDialogComponent, { ariaLabelledBy: "confirm-title", ariaDescribedBy: "confirm-message",
      width: 'min(420px, calc(100vw - 32px))', data: { title: 'Xóa tin tuyển dụng?', content: `Tin “${item.job.title}” sẽ không còn hiển thị cho ứng viên. Bạn có muốn tiếp tục?` }
    }).closed);
    if (!confirmed || this.deleting() !== null) return;
    this.deleting.set(item.job.jobId);
    try {
      const response = await this.workspace.deleteJob(item.job.jobId);
      if (response.statusCode !== 200 || !response.data) throw new Error(response.message || 'Không thể xóa tin tuyển dụng.');
      this.notices.success('Đã xóa tin tuyển dụng.'); await this.load();
    } catch (error) { this.notices.error(error instanceof Error ? error.message : 'Không thể xóa tin tuyển dụng.'); }
    finally { this.deleting.set(null); }
  }
}
