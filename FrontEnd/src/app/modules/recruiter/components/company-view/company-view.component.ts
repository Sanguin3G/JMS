import { ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { getRequest } from 'src/app/service/api-requests';
import { AuthorizationMode, apiRecruiter } from 'src/app/service/constant';
import { getProfile } from 'src/app/service/localstorage';
import { environment } from 'src/environments/environment';

@Component({
  standalone: false,
   selector: 'app-company-view',
   templateUrl: './company-view.component.html',
   styleUrls: ['./company-view.component.css']
})
export class CompanyViewComponent {
   company: any;
   Url = environment.Url;
   linkMap: any;
   htmlContent: any;
   profile: any;

   constructor(public router: Router, private viewportScroller: ViewportScroller) {
      this.viewportScroller.scrollToPosition([0, 0]);
      this.profile = getProfile();
      getRequest(apiRecruiter.GET_COMPANY_BY_ID + "/" + this.profile.companyId, AuthorizationMode.PUBLIC)
         .then(res => {
            this.company = res?.data
            this.htmlContent = this.company?.description;
            console.log(this.company)
         })
         .catch(data => {
            console.warn("Get API fail!" + data);
         })
   }

   onClickView(jd: any) {
      this.router.navigate(['/recruiter/view-jd-detail', jd?.jobId]);
   }
}
