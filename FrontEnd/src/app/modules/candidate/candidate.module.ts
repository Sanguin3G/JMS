import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateRoutingModule } from './candidate-routing.module';
import { CandidateComponent } from './candidate.component';
import { HeaderComponent } from './components/header/header.component';
import { CandidateSignInComponent } from './components/sign-in/sign-in.component';
import { CandidateRegisterComponent } from './components/sign-up/sign-up.component';
import { CandidateHomeComponent } from './components/home/home.component';
import { CandidateForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { CandidateCreateCvComponent } from './components/create-cv/create-cv.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FormsModule } from '@angular/forms';
import { SlidersComponent } from './components/sliders/sliders.component';
import { ListJobsComponent } from './components/list-jobs/list-jobs.component';
import { CandidateListCompaniesComponent } from './components/list-companies/list-companies.component';
import { CandidateMyCvsComponent } from './components/my-cvs/my-cvs.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { CompanyDetailComponent } from './components/company-detail/company-detail.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { JdDetailComponent } from './components/jd-detail/jd-detail.component';
import { MatTabsModule} from '@angular/material/tabs';
import { UpdateCvComponent } from './components/update-cv/update-cv.component';
import { MyApplyJobComponent } from './components/my-apply-job/my-apply-job.component';
import { ViewCvComponent } from './components/view-cv/view-cv.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ProfileComponent } from './components/profile/profile.component';
import { NotFoundComponent } from 'src/app/components/not-found/not-found.component';
import { ViewNullCandidateComponent } from './components/view-null/view-null.component'; 
import { ViewLoadingCandidateComponent } from './components/view-loading/view-loading.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CalibrationComponent } from './components/calibration/calibration.component';

@NgModule({
   declarations: [
      CandidateComponent,
      HeaderComponent,
      CandidateSignInComponent,
      CandidateRegisterComponent,
      CandidateHomeComponent,
      CandidateForgotPasswordComponent,
      CandidateCreateCvComponent,
      SlidersComponent,
      ListJobsComponent,
      CandidateListCompaniesComponent,
      CandidateMyCvsComponent,
      CompanyDetailComponent,
      JdDetailComponent,
      UpdateCvComponent,
      MyApplyJobComponent,
      ViewCvComponent,
      ProfileComponent,
      NotFoundComponent,
      ViewNullCandidateComponent,
      ViewLoadingCandidateComponent,
      ChangePasswordComponent,
      CalibrationComponent
   ],
   imports: [
      CommonModule,
      CandidateRoutingModule,
      CKEditorModule,
      FormsModule,
      MatFormFieldModule,
      MatSelectModule,
      ReactiveFormsModule,
      NgxPaginationModule,
      MatTabsModule,
      MatDialogModule
      ,SharedModule
   ],
})
export class CandidateModule { }
