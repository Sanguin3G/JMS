import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApiResponse, getRequest } from 'src/app/service/api-requests';
import { AuthorizationMode, apiCandidate } from 'src/app/service/constant';
import { getProfile } from 'src/app/service/localstorage';
import { ViewCvComponent } from '../view-cv/view-cv.component';
import { ToastrService } from 'ngx-toastr';
import { ApplicationRecord, MatchingExplanation, UserProfile } from 'src/app/core/models/api.models';

@Component({
  standalone: false,
   selector: 'app-my-apply-job',
   templateUrl: './my-apply-job.component.html',
   styleUrls: ['./my-apply-job.component.css']
})

export class MyApplyJobComponent {
   listJds: ApplicationRecord[] = [];
   profile: UserProfile | null;
   page = 1;
   itemsPerPage = 9;
   totalItems = 0;

   constructor(private router: Router, private toastr: ToastrService, public dialog: MatDialog) {
      this.profile = getProfile();
      if (this.profile) this.loadApplications(1);
   }

   private loadApplications(page: number): void {
      if (!this.profile) return;
      getRequest<ApiResponse<ApplicationRecord[]>>(`${apiCandidate.GET_ALL_CV_APPLIED}`, AuthorizationMode.BEARER_TOKEN, { candidateId: this.profile.id, pageIndex: page })
         .then(response => {
            this.totalItems = response.objectLength ?? 0;
            this.listJds = (response.data ?? []).map(application => this.normalizeApplication(application));
         })
         .catch(() => {
            this.listJds = [];
         });
   }

   pageChanged(page: number) {
      this.page = page
      this.loadApplications(this.page);
   }

   onClickViewJD(jd: ApplicationRecord) {
      this.router.navigate([`/candidate/jd-detail/${jd?.jobDescriptionId}`]);
   }

   openViewCVDialog(jd: ApplicationRecord) {
      this.dialog.open(ViewCvComponent, {
         width: '50%',
         height: '100%',
         data: { jd }
      });
   }

   private normalizeApplication(application: ApplicationRecord): ApplicationRecord {
      const matchingInsight = this.parseExplanation(application.jsonMatching);
      return {
         ...application,
         award: this.parseArray(application.award),
         certificate: this.parseArray(application.certificate),
         education: this.parseArray(application.education),
         jobExperience: this.parseArray(application.jobExperience),
         project: this.parseArray(application.project),
         skill: this.parseArray(application.skill),
         jsonMatching: matchingInsight,
         matchingInsight
      };
   }

   private parseArray(value: unknown): unknown[] {
      if (Array.isArray(value)) return value;
      if (typeof value !== 'string' || value.trim().length === 0) return [];
      try {
         const parsed: unknown = JSON.parse(value);
         return Array.isArray(parsed) ? parsed : [];
      } catch {
         return [];
      }
   }

   private parseExplanation(value: unknown): MatchingExplanation | null {
      if (value && typeof value === 'object') return value as MatchingExplanation;
      if (typeof value !== 'string' || value.trim().length === 0) return null;
      try {
         const parsed: unknown = JSON.parse(value);
         return parsed && typeof parsed === 'object' ? parsed as MatchingExplanation : null;
      } catch {
         return null;
      }
   }
}
