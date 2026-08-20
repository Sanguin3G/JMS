import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { getRequest, postRequest } from 'src/app/service/api-requests';
import { AuthorizationMode, apiRecruiter } from 'src/app/service/constant';
import { Router } from '@angular/router';

@Component({
  standalone: false,
   selector: 'app-list-companies',
   templateUrl: './list-companies.component.html',
   styleUrls: ['./list-companies.component.css']
})
export class CandidateListCompaniesComponent {
   categories: any;
   companies: any;
   page = 1;
   itemsPerPage = 9;
   totalItems = 0;
   categoryRq = new FormControl('0', [Validators.required, Validators.min(1)]);
   inputSearch = ""

   constructor(private router: Router) {
      getRequest(apiRecruiter.GET_COMPANY_PAGING, AuthorizationMode.PUBLIC, { page: this.page })
         .then(res => {
            this.companies = res?.data
            this.totalItems = res?.objectLength
            console.log(this.companies);
         })
         .catch(data => {
            console.warn(apiRecruiter.GET_ALL_CATEGORY, data);
         })

   }

   onClick(company: any) {
      this.router.navigate(['/candidate/company-detail', company?.companyId]);
   }

   pageChanged(page: any) {
      this.page = page
      getRequest(apiRecruiter.GET_COMPANY_PAGING, AuthorizationMode.PUBLIC, { page: this.page })
         .then(res => {
            this.companies = res?.data

         })
         .catch(data => {
            console.warn(apiRecruiter.GET_COMPANY_PAGING);
         })
   }

   SubmitSearch() {
      if (this.inputSearch === "") {
         getRequest(apiRecruiter.GET_COMPANY_PAGING, AuthorizationMode.PUBLIC, { page: 1 })
            .then(res => {
               this.companies = res?.data
               this.totalItems = res?.objectLength
               console.log(this.companies);
            })
            .catch(data => {
               console.warn(apiRecruiter.GET_ALL_CATEGORY, data);
            })
      } else {
         getRequest(`${apiRecruiter.SEARCH_COMPANY}?search=${this.inputSearch}&${this.page}`, AuthorizationMode.PUBLIC, { page: 1 })
            .then(res => {
               this.companies = res?.data
               this.totalItems = res?.objectLength
               console.log( this.companies);
               
            })
            .catch(data => {
               console.warn(apiRecruiter.GET_COMPANY_PAGING);
            })
      }
   }
}
