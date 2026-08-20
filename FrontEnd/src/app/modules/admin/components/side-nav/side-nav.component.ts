import { Component, OnChanges } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent{
  currentRouter: any;
  headerTitle = [{ title: 'dashboard', router: '/admin/dashboard', value: false },
  { title: 'company', router: '/admin/company-page', value: false },
  { title: 'candidate', router: '/admin/candidate-page', value: false },
  { title: 'recruiter', router: '/admin/recruiter-page', value: false }];

  constructor(private router: Router){
    console.log(router.url);
    if(router.url === "/admin/sign-in"){this.changeNav(0)}else{this.checkTab()}
    
  }

  changeNav(number: any){
    for (let i = 0; i < this.headerTitle.length; i++) {
      const elm = this.headerTitle[i];
      if(number === i){
        elm.value = true
      }else{
        elm.value = false
      }
    }
  }

  checkTab(){
    for (let i = 0; i < this.headerTitle.length; i++) {
      const elm = this.headerTitle[i];
      if(this.router.url === elm.router){
        this.changeNav(i)
      }
    }
  }
}
