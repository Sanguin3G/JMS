import { Component } from '@angular/core';
import { AuthorizationMode, apiCandidate } from 'src/app/service/constant';
import { getRequest, postRequest, postFileRequest } from 'src/app/service/api-requests';
import { Router } from '@angular/router';
import { ApiResponse } from 'src/app/service/api-requests';
import { JobSummary } from 'src/app/core/models/api.models';

@Component({
  standalone: false,
   selector: 'app-list-jobs',
   templateUrl: './list-jobs.component.html',
   styleUrls: ['./list-jobs.component.css']
})
export class ListJobsComponent {
   page = 1;
   itemsPerPage = 9;
   totalItems = 0;
   listJds: JobSummary[] = [];
   isLoading = true;
   errorMessage = '';

   constructor(private router: Router) {
      this.loadJobs();
   }

   private loadJobs(): void {
      this.isLoading = true;
      this.errorMessage = '';
      getRequest<ApiResponse<JobSummary[]>>(apiCandidate.GET_ALL_JDS_PAGING + "/" + this.page, AuthorizationMode.PUBLIC)
         .then(res => {
            if (res?.statusCode == 200) {
               this.listJds = res.data ?? [];
               this.totalItems = res?.objectLength
            }
            this.isLoading = false;
         })
         .catch(error => {
            this.errorMessage = error?.message || 'Unable to load jobs right now.';
            this.isLoading = false;
            console.warn(apiCandidate.GET_ALL_JDS_PAGING + "/" + this.page, error);
         })
   }

   pageChanged(page: any) {
      this.page = page
      this.loadJobs();
   }


   onClick(jd: JobSummary) {
      this.router.navigate(['/candidate/jd-detail/', jd?.jobId]);
   }
}
