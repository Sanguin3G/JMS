import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminSettingComponent } from './components/setting/setting.component';
import { AuthSignInComponent } from 'src/app/shared/auth-sign-in/auth-sign-in.component';
import { CompanyComponent } from './components/company/company.component';
import { MainComponent } from './components/main/main.component';
import { JdDetailComponent } from './components/jd-detail/jd-detail.component';
import { CandidateComponent } from './components/candidate/candidate.component';
import { RecruiterComponent } from './components/recruiter/recruiter.component';
import { roleGuard } from 'src/app/core/auth/role.guard';
import { ProfileComponent } from './components/profile/profile.component';

const routes: Routes = [
   { path: "setting", component: AdminSettingComponent, canActivate: [roleGuard] },
   { path: "sign-in", component: AuthSignInComponent },
   { path: "company-page", component: CompanyComponent, canActivate: [roleGuard] },
   { path: "dashboard", component: MainComponent, canActivate: [roleGuard] },
   { path: "", redirectTo: "dashboard", pathMatch: "full" },
   { path: "view-jd/:id", component: JdDetailComponent, canActivate: [roleGuard] },
   { path: "candidate-page", component: CandidateComponent, canActivate: [roleGuard] },
   { path: "recruiter-page", component: RecruiterComponent, canActivate: [roleGuard] },
   { path: "profile", component: ProfileComponent, canActivate: [roleGuard] },
];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule]
})
export class AdminRoutingModule { }
