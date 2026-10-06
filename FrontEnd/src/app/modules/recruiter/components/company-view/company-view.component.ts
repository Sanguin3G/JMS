import { ViewportScroller } from '@angular/common';
import { inject, Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/core/http/api.service';
import { AuthorizationMode, apiRecruiter } from 'src/app/service/constant';
import { AuthService } from 'src/app/core/auth/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  standalone: false,
   selector: 'app-company-view',
   templateUrl: './company-view.component.html',
   styleUrls: ['../../../../shared/company-profile.css']
})
export class CompanyViewComponent {
   private readonly auth = inject(AuthService);
   private readonly api = inject(ApiService);
   company: any;
   loading = true;
   error = '';
   Url = environment.Url;
   linkMap: any;
   htmlContent: any;
   profile: any;

   constructor(public router: Router, private viewportScroller: ViewportScroller) {
      this.viewportScroller.scrollToPosition([0, 0]);
      this.profile = this.auth.getProfile();
      this.api.getRequest(apiRecruiter.GET_COMPANY_BY_ID + "/" + this.profile.companyId, AuthorizationMode.PUBLIC)
         .then(res => {
            if (res.statusCode !== 200 || !res.data) throw new Error();
            this.company = res.data
            this.htmlContent = this.company?.description;

         })
         .catch(data => {
            this.error = 'Không thể tải thông tin công ty. Hãy tải lại trang để thử lại.';
         }).finally(() => { this.loading = false; });
   }

   onClickView(jd: any) {
      this.router.navigate(['/recruiter/view-jd-detail', jd?.jobId]);
   }
}
