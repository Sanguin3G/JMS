import { inject, Component } from '@angular/core';
import { Router } from '@angular/router';
import { ADMIN_TOKEN } from 'src/app/service/constant';
import { AuthService } from 'src/app/core/auth/auth.service';
@Component({
  standalone: false,
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
   private readonly auth = inject(AuthService);

  constructor(private router: Router) {
  }

  isLogin(){
    return this.auth.isRole('admin')
  }
}
