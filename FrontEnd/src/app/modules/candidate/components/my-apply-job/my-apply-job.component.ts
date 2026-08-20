import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { getRequest } from 'src/app/service/api-requests';
import { AuthorizationMode, apiCandidate } from 'src/app/service/constant';
import { getProfile, signOut } from 'src/app/service/localstorage';
import { ViewCvComponent } from '../view-cv/view-cv.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  standalone: false,
   selector: 'app-my-apply-job',
   templateUrl: './my-apply-job.component.html',
   styleUrls: ['./my-apply-job.component.css']
})

export class MyApplyJobComponent {
   listJds: any;
   profile: any;
   passenger: any;
   page = 1;
   itemsPerPage = 9;
   totalItems = 0;

   constructor(private router: Router, private toastr: ToastrService, public dialog: MatDialog) {
      this.profile = getProfile();

      getRequest(`${apiCandidate.GET_ALL_CV_APPLIED}`, AuthorizationMode.BEARER_TOKEN, { candidateId: this.profile.id, pageIndex: 1 })
         .then(res => {
            this.listJds = res?.data

            console.log(this.listJds);
            
            try {
               this.totalItems = res?.objectLength

               for (let index = 0; index < this.listJds.length; index++) {
                  this.listJds[index].award = JSON.parse(this.listJds[index].award)
                  this.listJds[index].certificate = JSON.parse(this.listJds[index].certificate)
                  this.listJds[index].education = JSON.parse(this.listJds[index].education)
                  this.listJds[index].jobExperience = JSON.parse(this.listJds[index].jobExperience)
                  this.listJds[index].jsonMatching = JSON.parse(this.listJds[index].jsonMatching)
                  this.listJds[index].project = JSON.parse(this.listJds[index].project)
                  this.listJds[index].skill = JSON.parse(this.listJds[index].skill)
               }
            } catch {

            }

         })
         .catch(data => {
         })
   }

   pageChanged(page: any) {
      this.page = page
      getRequest(`${apiCandidate.GET_ALL_CV_APPLIED}`, AuthorizationMode.BEARER_TOKEN, { candidateId: this.profile.id, page: this.page })
         .then(res => {
            this.listJds = res?.data

         })
         .catch(data => {
         })
   }

   onClickViewJD(jd: any) {
      this.router.navigate([`/candidate/jd-detail/${jd?.jobDescriptionId}`]);
   }

   openViewCVDialog(jd: any) {
      this.dialog.open(ViewCvComponent, {
         width: '50%',
         height: '100%',
         data: { jd }
      });
   }
}
