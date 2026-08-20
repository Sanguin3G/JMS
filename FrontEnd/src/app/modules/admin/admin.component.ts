import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ADMIN_TOKEN } from 'src/app/service/constant';
import { getItem } from 'src/app/service/localstorage';
@Component({
  standalone: false,
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {

  constructor(private router: Router) {
  }

  isLogin(){
    return getItem(ADMIN_TOKEN) !== null
  }
}
