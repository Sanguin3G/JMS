import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthSignInComponent } from 'src/app/shared/auth-sign-in/auth-sign-in.component';
import { AuthRegisterComponent } from 'src/app/shared/auth-register/auth-register.component';
import { CandidateHomeComponent } from './components/home/home.component';
import { CandidateCreateCvComponent } from './components/create-cv/create-cv.component';
import { CandidateListCompaniesComponent } from './components/list-companies/list-companies.component';
import { CandidateMyCvsComponent } from './components/my-cvs/my-cvs.component';
import { CompanyDetailComponent } from './components/company-detail/company-detail.component';
import { JdDetailComponent } from './components/jd-detail/jd-detail.component';
import { MyApplyJobComponent } from './components/my-apply-job/my-apply-job.component';
import { CvPreviewComponent } from 'src/app/shared/cv-preview/cv-preview.component';
import { UpdateCvComponent } from './components/update-cv/update-cv.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { roleGuard } from 'src/app/core/auth/role.guard';
import { unsavedChangesGuard } from 'src/app/core/forms/unsaved-changes.guard';
import { CalibrationComponent } from './components/calibration/calibration.component';
import { SavedJobsComponent } from './components/saved-jobs/saved-jobs.component';

const routes: Routes = [
   { path: 'saved-jobs', title: 'JMS · Việc làm đã lưu', component: SavedJobsComponent, canActivate: [roleGuard] },
   { path: "sign-in", title: "Ứng viên - Đăng nhập", component: AuthSignInComponent },
   { path: "sign-up", title: "Ứng viên - Đăng ký", component: AuthRegisterComponent },
   { path: "create-cv/:id", title: "Ứng viên - Tạo CV", component: CandidateCreateCvComponent, canActivate: [roleGuard], canDeactivate: [unsavedChangesGuard] },
   { path: "your-cvs", title: "Ứng viên - Danh sách hồ sơ", component: CandidateMyCvsComponent, canActivate: [roleGuard] },
   { path: "your-apply-job", title: "Ứng viên - Danh sách công việc ứng tuyển", component: MyApplyJobComponent, canActivate: [roleGuard] },
   { path: "list-companies", title: "Ứng viên - Danh sách công ty", component: CandidateListCompaniesComponent },
   { path: "company-detail/:id", title: "Ứng viên - Chi tiết công ty công ty", component: CompanyDetailComponent },
   { path: "jd-detail/:id", title: "Ứng viên - Chi tiết công việc", component: JdDetailComponent },
   { path: "update-cv/:id", title: "Ứng viên - Cập nhật cv", component: UpdateCvComponent, canActivate: [roleGuard], canDeactivate: [unsavedChangesGuard] },
   { path: "view-cv/:id", title: "Ứng viên - Chi tiết Hồ sơ", component: CvPreviewComponent, canActivate: [roleGuard] },
   { path: "profile", title: "Ứng viên - Chi tiết thông tin cá nhân", component: ProfileComponent, canActivate: [roleGuard] },
   { path: "change-password", title: "Ứng viên - Thay đổi mật khẩu", component: ChangePasswordComponent, canActivate: [roleGuard] },
   { path: "calibration", title: "JMS - Career Calibration Terminal", component: CalibrationComponent },
   { path: "", component: CandidateHomeComponent }
];

@NgModule({
   imports: [
      RouterModule.forChild(routes)
   ],
   exports: [RouterModule]
})
export class CandidateRoutingModule { }
