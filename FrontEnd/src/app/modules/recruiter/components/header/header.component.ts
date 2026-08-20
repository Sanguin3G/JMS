import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { postRequest } from 'src/app/service/api-requests';
import { AuthorizationMode, RECRUITER_TOKEN, apiRecruiter } from 'src/app/service/constant';
import { getProfile, getToken, isLogin, removeItem, saveItem, signOut } from 'src/app/service/localstorage';

@Component({
  standalone: false,
   selector: 'app-header-recruiter',
   templateUrl: './header.component.html',
   styleUrls: ['./header.component.css'],
   encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {
   isLog: boolean = true;
   hasCompany: boolean = true;
   profile: any;
   headerTitle = [{ title: 'baiDang', router: '/recruiter/list-jds', value: false },
   { title: 'congTy', router: '/recruiter/view-company', value: false },
   { title: 'taoCty', router: '/recruiter/create-company', value: false },
   { title: 'dangTuyen', router: '/recruiter/create-jd', value: false }];
   currentRouter: any;

   auth() {
      this.profile = getProfile();
   }

   constructor(private router: Router) {
      this.changeHeader();
   }

   signOut() {
      signOut();
      removeItem(RECRUITER_TOKEN)
      this.isLog = false
      this.router.navigate(['/recruiter/landing-page']);
   }

   changeHeader() {
      this.profile = getProfile();

      if (this.profile.companyId === null) {
         this.hasCompany = false
      }

      this.currentRouter = this.router.url;

      for (let i = 0; i < this.headerTitle.length; i++) {
         if (this.currentRouter == this.headerTitle[i].router) {
            this.headerTitle[i].value = true
         } else {
            this.headerTitle[i].value = false
         }
      }
   }

   ngOnInit() {
      this.changeHeader()
      console.log('Component initialized');
   }
}
