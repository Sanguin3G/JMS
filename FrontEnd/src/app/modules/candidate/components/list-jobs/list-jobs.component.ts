import { Component } from '@angular/core';
import { AuthorizationMode, apiCandidate } from 'src/app/service/constant';
import { getRequest, postRequest, postFileRequest } from 'src/app/service/api-requests';
import { Router } from '@angular/router';

@Component({
  standalone: false,
   selector: 'app-list-jobs',
   templateUrl: './list-jobs.component.html',
   styleUrls: ['./list-jobs.component.css']
})
export class ListJobsComponent {
   page = 1;
   itemsPerPage = 9;
   totalItems = 0;
   listJds: any;

   constructor(private router: Router) {
      getRequest(apiCandidate.GET_ALL_JDS_PAGING + "/" + this.page, AuthorizationMode.PUBLIC)
         .then(res => {
            if (res?.statusCode == 200) {
               this.listJds = res?.data
               this.totalItems = res?.objectLength
               console.log(this.listJds);
            }
         })
         .catch(data => {
            console.warn(apiCandidate.GET_ALL_JDS_PAGING + "/" + this.page, data);
         })
   }

   pageChanged(page: any) {
      this.page = page
      getRequest(apiCandidate.GET_ALL_JDS_PAGING + "/" + this.page, AuthorizationMode.PUBLIC)
         .then(res => {
            if (res?.statusCode == 200) {
               this.listJds = res?.data
               this.totalItems = res?.objectLength
               console.log(this.listJds);
            }
         })
         .catch(data => {
            console.warn(apiCandidate.GET_ALL_JDS_PAGING + "/" + this.page);
         })
   }


   onClick(jd: any) {
      this.router.navigate(['/candidate/jd-detail/', jd?.jobId]);
   }
}
