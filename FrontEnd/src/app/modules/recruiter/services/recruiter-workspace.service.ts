import { Injectable, inject } from '@angular/core';
import { ApiResponse, ApiService } from 'src/app/core/http/api.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { JobSummary } from 'src/app/core/models/api.models';
import { AuthorizationMode, apiRecruiter } from 'src/app/service/constant';

export interface RecruiterJobItem { job: JobSummary; applicantCount: number; matchCount: number; }
export interface RecentApplication { applicationId: number; jobId: number; candidateName: string; jobTitle: string; appliedAt: string; status: 'applied' | 'selected' | 'rejected'; }
export interface RecruiterDashboard {
  totalJobs: number; activeJobs: number; expiredJobs: number; applications: number;
  selectedApplications: number; rejectedApplications: number;
  recentApplications: RecentApplication[]; recentJobs: RecruiterJobItem[];
}
export type JobStatusFilter = 'all' | 'active' | 'expired';

@Injectable({ providedIn: 'root' })
export class RecruiterWorkspaceService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  dashboard(): Promise<ApiResponse<RecruiterDashboard>> {
    return this.api.getRequest<ApiResponse<RecruiterDashboard>>('/api/recruiter/dashboard', AuthorizationMode.BEARER_TOKEN);
  }
  jobs(page: number, query: string, status: JobStatusFilter): Promise<ApiResponse<RecruiterJobItem[]>> {
    return this.api.getRequest<ApiResponse<RecruiterJobItem[]>>('/api/recruiter/jobs', AuthorizationMode.BEARER_TOKEN, { page, pageSize: 9, query, status });
  }
  deleteJob(id: number): Promise<ApiResponse<number>> {
    return this.api.postRequest<ApiResponse<number>>(`${apiRecruiter.DELETE_JD_BY_ID}/${this.auth.getProfile()!.id}/${id}`, AuthorizationMode.BEARER_TOKEN, {});
  }
}
