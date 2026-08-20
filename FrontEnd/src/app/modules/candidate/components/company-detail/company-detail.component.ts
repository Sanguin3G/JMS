import { Component } from '@angular/core';
import { getRequest } from 'src/app/service/api-requests';
import { AuthorizationMode, apiRecruiter } from 'src/app/service/constant';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  standalone: false,
   selector: 'app-company-detail',
   templateUrl: './company-detail.component.html',
   styleUrls: ['./company-detail.component.css']
})

export class CompanyDetailComponent {

   company: any;
   Url = environment.Url;
   htmlContent: any;
   countJob: number = 0

   getCompanyById(id: any) {
      getRequest(apiRecruiter.GET_COMPANY_BY_ID + "/" + id, AuthorizationMode.PUBLIC)
         .then(res => {
            console.log(res);
            if (res?.statusCode == 200) {
               this.company = res?.data
               this.countJob = this.company?.jDs.length
               this.htmlContent = this.company?.description;
            }
         })
         .catch(data => {
            console.warn(apiRecruiter.GET_COMPANY_BY_ID);
         })
   }

   constructor(private route: ActivatedRoute) {
      let id: any;
      this.route.params.subscribe(params => {
         id = params['id'];
      });

      this.getCompanyById(id);
   }
}
