import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RecruiterRoutingModule } from './recruiter-routing.module';
import { RecruiterSignInComponent } from './components/sign-in/sign-in.component';
import { HeaderComponent } from './components/header/header.component';
import { RecruiterComponent } from './recruiter.component';
import { CreateCompanyComponent } from './components/create-company/create-company.component';
import { CompanyUpdateComponent } from './components/company-update/company-update.component';
import { RegisterRecruiterComponent } from './components/sign-up/sign-up.component';
import { CreateJdComponent } from './components/create-jd/create-jd.component';
import { ListJdsComponent } from './components/list-jds/list-jds.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { JdUpdateComponent } from './components/jd-update/jd-update.component';
import { MatDialogModule } from '@angular/material/dialog';
import { JdDetailComponent } from './components/jd-detail/jd-detail.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ListCandidateComponent } from './components/list-candidate/list-candidate.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { AutosizeModule } from 'ngx-autosize';
import { OptionMatchModalComponent } from './components/option-match-modal/option-match-modal.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { CompanyViewComponent } from './components/company-view/company-view.component';
import { MatMenuModule } from '@angular/material/menu';
import { ProfileComponent } from './components/profile/profile.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ViewNullComponent } from './components/view-null/view-null.component';
import { ViewLoadingComponent } from './components/view-loading/view-loading.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
   declarations: [
      RecruiterSignInComponent,
      HeaderComponent,
      RecruiterComponent,
      CreateCompanyComponent,
      RegisterRecruiterComponent,
      CompanyUpdateComponent,
      CreateJdComponent,
      ListJdsComponent,
      JdUpdateComponent,
      JdDetailComponent,
      ListCandidateComponent,
      OptionMatchModalComponent,
      LandingPageComponent,
      CompanyViewComponent,
      ProfileComponent,
      ForgotPasswordComponent,
      ViewNullComponent,
      ViewLoadingComponent
   ],
   imports: [
      CommonModule,
      RecruiterRoutingModule,
      CKEditorModule,
      FormsModule,
      ReactiveFormsModule,
      MatInputModule,
      MatFormFieldModule,
      MatSelectModule,
      MatToolbarModule,
      MatButtonModule,
      MatIconModule,
      NgxPaginationModule,
      MatDialogModule,
      MatTabsModule,
      MatDividerModule,
      MatListModule,
      AutosizeModule,
      MatCheckboxModule,
      MatPaginatorModule,
      MatMenuModule,
      MatTooltipModule,
      SharedModule,
   ],
   providers: [
      DatePipe,
   ]
})
export class RecruiterModule { }
