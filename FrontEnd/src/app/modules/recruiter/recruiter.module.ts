import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RichTextComponent } from 'src/app/shared/rich-text/rich-text.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RecruiterRoutingModule } from './recruiter-routing.module';

import { HeaderComponent } from './components/header/header.component';
import { RecruiterComponent } from './recruiter.component';
import { CreateCompanyComponent } from './components/create-company/create-company.component';
import { CompanyUpdateComponent } from './components/company-update/company-update.component';

import { CreateJdComponent } from './components/create-jd/create-jd.component';
import { ListJdsComponent } from './components/list-jds/list-jds.component';
import { PaginationComponent } from 'src/app/shared/pagination/pagination.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { JdUpdateComponent } from './components/jd-update/jd-update.component';
import { DialogModule } from '@angular/cdk/dialog';
import { JdDetailComponent } from './components/jd-detail/jd-detail.component';
import { ListCandidateComponent } from './components/list-candidate/list-candidate.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { CompanyViewComponent } from './components/company-view/company-view.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ViewNullComponent } from './components/view-null/view-null.component';
import { ViewLoadingComponent } from './components/view-loading/view-loading.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
   declarations: [

      HeaderComponent,
      DashboardComponent,
      RecruiterComponent,
      CreateCompanyComponent,

      CompanyUpdateComponent,
      CreateJdComponent,
      ListJdsComponent,
      JdUpdateComponent,
      JdDetailComponent,
      ListCandidateComponent,
      LandingPageComponent,
      CompanyViewComponent,
      ProfileComponent,

      ViewNullComponent,
      ViewLoadingComponent
   ],
   imports: [
      CommonModule,
      RecruiterRoutingModule,
      RichTextComponent,
      FormsModule,
      ReactiveFormsModule,





      PaginationComponent,
      DialogModule,


      SharedModule,
   ],
   providers: [
      DatePipe,
   ]
})
export class RecruiterModule { }
