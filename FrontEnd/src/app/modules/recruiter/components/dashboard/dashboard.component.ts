import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from 'src/app/core/auth/auth.service';
import { RecruiterDashboard, RecruiterWorkspaceService } from '../../services/recruiter-workspace.service';

@Component({ standalone: false, selector: 'app-recruiter-dashboard', templateUrl: './dashboard.component.html', styleUrls: ['./dashboard.component.css'] })
export class DashboardComponent implements OnInit {
  private readonly workspace = inject(RecruiterWorkspaceService);
  readonly profile = inject(AuthService).currentUser;
  readonly data = signal<RecruiterDashboard | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  ngOnInit(): void { void this.load(); }
  async load(): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true); this.error.set('');
    try {
      const response = await this.workspace.dashboard();
      if (!response.data || response.statusCode !== 200) throw new Error(response.message || 'Không thể tải tổng quan.');
      this.data.set(response.data);
    } catch (error) { this.error.set(error instanceof Error ? error.message : 'Không thể tải tổng quan.'); }
    finally { this.loading.set(false); }
  }
  statusLabel(status: string): string { return ({ applied: 'Đã ứng tuyển', selected: 'Đã chọn', rejected: 'Đã từ chối' } as Record<string, string>)[status] || status; }
}
