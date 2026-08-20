import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ADMIN_TOKEN, RECRUITER_TOKEN } from 'src/app/service/constant';
import { getItem, getProfile, signOut } from 'src/app/service/localstorage';

@Component({
  standalone: false,
   selector: 'candidate-header',
   templateUrl: './header.component.html',
   styleUrls: ['./header.component.css']
})
export class HeaderComponent {

   menuOpen = false;

   isLog: boolean = true;
   profile: any;
   headerTitle = [{ title: 'jobs', router: '/candidate', value: false },
   { title: 'cv', router: '/candidate/your-cvs', value: false },
   { title: 'company', router: '/candidate/list-companies', value: false },
   { title: 'yourWork', router: '/candidate/your-apply-job', value: false }];
   currentRouter: any;
   isRecruiter: any
   isAdmin: any

   loadProfile() {
      this.isRecruiter = getItem(RECRUITER_TOKEN) !== null
      this.isAdmin = getItem(ADMIN_TOKEN) !== null
      if(this.isRecruiter || this.isAdmin){
         signOut()
         this.profile = null
      }else{
         this.profile = getProfile();
      }
   }

   constructor(private router: Router) {
      this.loadProfile()
      this.changeHeader();
   }

   signOut() {
      signOut();
      this.router.navigate(['/candidate/sign-in']);
   }

   toggleMenu(): void {
      this.menuOpen = !this.menuOpen;
   }

   changeHeader() {
      this.currentRouter = this.router.url;
      for (let i = 0; i < this.headerTitle.length; i++) {
         if (this.currentRouter == this.headerTitle[i].router) {
            this.headerTitle[i].value = true
         } else {
            this.headerTitle[i].value = false
         }
      }
   }
}
