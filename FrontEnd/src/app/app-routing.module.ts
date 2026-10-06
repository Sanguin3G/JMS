import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './modules/admin/admin.component';
import { CandidateComponent } from './modules/candidate/candidate.component';
import { RecruiterComponent } from './modules/recruiter/recruiter.component';


const routes: Routes = [


   // Router admin
   {
      path: "admin",
      title: "Admin",
      component: AdminComponent,
      loadChildren: () => import('./modules/admin/admin.module').then(x => x.AdminModule)
   },

   // Router candidate
   {
      path: "candidate",
      title: "Ứng Viên",
      component: CandidateComponent,
      loadChildren: () => import('./modules/candidate/candidate.module').then(x => x.CandidateModule)
   },

   // Router recuiter
   {
      path: "recruiter",
      title: "Nhà tuyển dụng",
      component: RecruiterComponent,
      loadChildren: () => import('./modules/recruiter/recruiter.module').then(x => x.RecruiterModule)
   },

   { path: '**', redirectTo: '/candidate', pathMatch: 'full' },

];

@NgModule({
   imports: [RouterModule.forRoot(routes)],
   exports: [RouterModule]
})
export class AppRoutingModule { }
