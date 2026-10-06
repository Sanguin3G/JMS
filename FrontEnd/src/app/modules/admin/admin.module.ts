import { PaginationComponent } from 'src/app/shared/pagination/pagination.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';

import { AdminSettingComponent } from './components/setting/setting.component';
import { AdminComponent } from './admin.component';
import { HeaderComponent } from './components/header/header.component';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { TopWidgetsComponent } from './components/top-widgets/top-widgets.component';
import { MainComponent } from './components/main/main.component';
import { CompanyComponent } from './components/company/company.component';
import { AccountComponent } from './components/account/account.component';
import { CandidateComponent } from './components/candidate/candidate.component';
import { RecruiterComponent } from './components/recruiter/recruiter.component';

import { CustomFilterPipe } from './custom-filter-pipe.pipe';
import { FormsModule } from '@angular/forms';
import { DialogModule } from '@angular/cdk/dialog';
import { CompanyViewComponent } from './components/company-view/company-view.component';
import { JdDetailComponent } from './components/jd-detail/jd-detail.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SharedModule } from 'src/app/shared/shared.module';
@NgModule({
   declarations: [
      AdminSettingComponent,

      AdminComponent,
      HeaderComponent,
      SideNavComponent,
      TopWidgetsComponent,
      MainComponent,
      CompanyComponent,
      AccountComponent,
      CandidateComponent,
      RecruiterComponent,
      CustomFilterPipe,
      CompanyViewComponent,
      JdDetailComponent,
      ProfileComponent,
   ],
   imports: [
      CommonModule,
      PaginationComponent,
      AdminRoutingModule,

      FormsModule,
      DialogModule,
      SharedModule,
   ]
})
export class AdminModule { }
