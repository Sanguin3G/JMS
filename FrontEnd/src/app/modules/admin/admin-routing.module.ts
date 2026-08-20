import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminSettingComponent } from './components/setting/setting.component';
import { AdminSignInComponent } from './components/sign-in/sign-in.component';
import { AdminSignUpComponent } from './components/sign-up/sign-up.component';
import { CompanyComponent } from './components/company/company.component';
import { MainComponent } from './components/main/main.component';
import { JdDetailComponent } from './components/jd-detail/jd-detail.component';
import { CandidateComponent } from './components/candidate/candidate.component';
import { RecruiterComponent } from './components/recruiter/recruiter.component';
import { authGuard } from './auth.guard';
import { ProfileComponent } from './components/profile/profile.component';

const routes: Routes = [
   { path: "setting", component: AdminSettingComponent, canActivate: [authGuard] },
   { path: "sign-in", component: AdminSignInComponent },
   { path: "sign-up", component: AdminSignUpComponent },
   { path: "company-page", component: CompanyComponent, canActivate: [authGuard] },
   { path: "dashboard", component: MainComponent, canActivate: [authGuard] },
   { path: "", component: MainComponent, canActivate: [authGuard] },
   { path: "view-jd/:id", component: JdDetailComponent, canActivate: [authGuard] },
   { path: "candidate-page", component: CandidateComponent, canActivate: [authGuard] },
   { path: "recruiter-page", component: RecruiterComponent, canActivate: [authGuard] },
   { path: "profile", component: ProfileComponent, canActivate: [authGuard] },
];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule]
})
export class AdminRoutingModule { }
