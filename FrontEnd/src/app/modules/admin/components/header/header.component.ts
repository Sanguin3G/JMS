import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ADMIN_PROFILE, ADMIN_TOKEN } from 'src/app/service/constant';
import { getItem, getItemJson, removeItem, saveItem, signOut } from 'src/app/service/localstorage';

@Component({
  standalone: false,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  profile: any

  constructor(private router: Router){
    this.getProfile()
  }

  signOut(){
    removeItem(ADMIN_TOKEN);
    removeItem(ADMIN_PROFILE);
    signOut()
    this.router.navigate(['/admin/sign-in'])
  }

  getProfile(){
    this.profile = getItemJson(ADMIN_PROFILE)
    // console.log(this.profile?.fullName);
    
  }
}
