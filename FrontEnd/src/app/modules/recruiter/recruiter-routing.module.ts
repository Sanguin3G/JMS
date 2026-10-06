import { NgModule } from '@angular/core';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthSignInComponent } from 'src/app/shared/auth-sign-in/auth-sign-in.component';
import { CreateCompanyComponent } from './components/create-company/create-company.component';
import { CompanyUpdateComponent } from './components/company-update/company-update.component';
import { CreateJdComponent } from './components/create-jd/create-jd.component';
import { ListJdsComponent } from './components/list-jds/list-jds.component';
import { JdUpdateComponent } from './components/jd-update/jd-update.component';
import { JdDetailComponent } from './components/jd-detail/jd-detail.component';
import { AuthRegisterComponent } from 'src/app/shared/auth-register/auth-register.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { CompanyViewComponent } from './components/company-view/company-view.component';
import { ProfileComponent } from './components/profile/profile.component';
import { roleGuard } from 'src/app/core/auth/role.guard';

const routes: Routes = [
   { path: "dashboard", title: "Tổng quan tuyển dụng | JMS", component: DashboardComponent, canActivate: [roleGuard] },
   { path: "sign-in", title: "Nhà tuyển dụng - Đăng nhập", component: AuthSignInComponent },
   { path: "sign-up", title: "Nhà tuyển dụng - Đăng ký", component: AuthRegisterComponent },
   { path: "create-company", title: "Nhà tuyển dụng - Đăng ký công ty", component: CreateCompanyComponent, canActivate: [roleGuard] },
   { path: "company-update", title: "Nhà tuyển dụng - Chỉnh sửa công ty", component: CompanyUpdateComponent, canActivate: [roleGuard] },
   { path: "create-jd", title: "Nhà tuyển dụng - Đăng ký bài tuyển dụng", component: CreateJdComponent, canActivate: [roleGuard] },
   { path: "list-jds", title: "Nhà tuyển dụng - Danh sách bài tuyển dụng", component: ListJdsComponent, canActivate: [roleGuard] },
   { path: "", title: "Nhà tuyển dụng - Landing Page", component: LandingPageComponent },
   { path: "jd-detail/:id", title: "Nhà tuyển dụng - Cập nhật bài tuyển dụng", component: JdUpdateComponent, canActivate: [roleGuard] },
   { path: "view-jd-detail/:id", title: "Nhà tuyển dụng - Chi tiết bài tuyển dụng", component: JdDetailComponent, canActivate: [roleGuard] },
   { path: "landing-page", title: "Landing Page", component: LandingPageComponent },
   { path: "view-company", title: "Nhà tuyển dụng - Thông Tin Công Ty", component: CompanyViewComponent, canActivate: [roleGuard] },
   { path: "profile", title: "Nhà tuyển dụng - Thông Tin Cá Nhân", component: ProfileComponent, canActivate: [roleGuard] },
];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule]
})
export class RecruiterRoutingModule { }
