import { Injectable, inject } from '@angular/core';
import { ApiResponse, ApiService } from '../http/api.service';
import { CatalogItem, JobSummary } from '../models/api.models';
import { apiRecruiter, AuthorizationMode } from 'src/app/service/constant';
export interface JobSearch { page: number; pageSize: number; query: string; location: string; categoryId: number | null; employmentTypeId: number | null; levelId: number | null; sort: string; }
@Injectable({ providedIn: 'root' })
export class JobService {
  private readonly api = inject(ApiService);
  search(filters: JobSearch): Promise<ApiResponse<JobSummary[]>> {
    return this.api.getRequest('/api/jobs/search', AuthorizationMode.PUBLIC, { ...filters });
  }
  categories(): Promise<ApiResponse<CatalogItem[]>> { return this.api.getRequest(apiRecruiter.GET_ALL_CATEGORY, AuthorizationMode.PUBLIC); }
  employmentTypes(): Promise<ApiResponse<CatalogItem[]>> { return this.api.getRequest(apiRecruiter.GET_ALL_EMPLOYMENT_TYPE, AuthorizationMode.PUBLIC); }
}
