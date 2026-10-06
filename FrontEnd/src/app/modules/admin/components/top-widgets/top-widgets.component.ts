import { inject, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService, ApiResponse } from 'src/app/core/http/api.service';
import { AuthorizationMode, apiAdmin } from 'src/app/service/constant';

interface JmsStatistics {
  totalCompany: number;
  totalJDs: number;
  totalCV: number;
  totalMatching: number;
  totalCandidates: number;
  totalRecruiters: number;
  activeJobs: number;
  expiredJobs: number;
  activeCVs: number;
  applications: number;
  selectedApplications: number;
  rejectedApplications: number;
}

@Component({
  standalone: false,
  selector: 'app-top-widgets',
  templateUrl: './top-widgets.component.html',
  styleUrls: ['./top-widgets.component.css']
})
export class TopWidgetsComponent implements OnInit {
   private readonly api = inject(ApiService);
  statistics: JmsStatistics | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(private readonly changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void { void this.loadStatistics(); }

  async loadStatistics(): Promise<void> {
    if (this.isLoading && this.statistics) return;
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const response = await this.api.getRequest<ApiResponse<JmsStatistics>>(apiAdmin.GET_STATISTIC, AuthorizationMode.BEARER_TOKEN);
      if (response.statusCode !== 200 || !response.data) throw new Error('Statistics unavailable');
      this.statistics = response.data;
    } catch {
      this.errorMessage = 'Không thể tải thống kê. Vui lòng thử lại.';
    } finally {
      this.isLoading = false;
      this.changeDetector.detectChanges();
    }
  }
}
