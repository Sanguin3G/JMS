import { CvPreviewComponent } from './components/cv-preview/cv-preview.component';
import { A11yModule } from '@angular/cdk/a11y';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateRoutingModule } from './candidate-routing.module';
import { CandidateComponent } from './candidate.component';
import { HeaderComponent } from './components/header/header.component';


import { CandidateHomeComponent } from './components/home/home.component';
import { CandidateCreateCvComponent } from './components/create-cv/create-cv.component';
import { FormsModule } from '@angular/forms';
import { ListJobsComponent } from './components/list-jobs/list-jobs.component';
import { CandidateListCompaniesComponent } from './components/list-companies/list-companies.component';
import { CandidateMyCvsComponent } from './components/my-cvs/my-cvs.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CompanyDetailComponent } from './components/company-detail/company-detail.component';
import { JdDetailComponent } from './components/jd-detail/jd-detail.component';
import { UpdateCvComponent } from './components/update-cv/update-cv.component';
import { MyApplyJobComponent } from './components/my-apply-job/my-apply-job.component';
import { DialogModule } from '@angular/cdk/dialog';
import { ProfileComponent } from './components/profile/profile.component';
import { ViewNullCandidateComponent } from './components/view-null/view-null.component';
import { ViewLoadingCandidateComponent } from './components/view-loading/view-loading.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CalibrationComponent } from './components/calibration/calibration.component';
import { SavedJobsComponent } from './components/saved-jobs/saved-jobs.component';
import { JobCardComponent } from 'src/app/shared/job-card/job-card.component';
import { PaginationComponent } from 'src/app/shared/pagination/pagination.component';

@NgModule({
   declarations: [CvPreviewComponent,
      CandidateComponent,
      HeaderComponent,


      CandidateHomeComponent,

      CandidateCreateCvComponent,
      ListJobsComponent,
      SavedJobsComponent,
      CandidateListCompaniesComponent,
      CandidateMyCvsComponent,
      CompanyDetailComponent,
      JdDetailComponent,
      UpdateCvComponent,
      MyApplyJobComponent,
      ProfileComponent,

      ViewNullCandidateComponent,
      ViewLoadingCandidateComponent,
      ChangePasswordComponent,
      CalibrationComponent
   ],
   imports: [
      CommonModule,
      A11yModule,
      JobCardComponent,
      PaginationComponent,
      CandidateRoutingModule,
      FormsModule,

      ReactiveFormsModule,

      DialogModule
      ,SharedModule
   ],
})
export class CandidateModule { }
