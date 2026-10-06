import { inject, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  standalone: false,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['../../../../shared/workspace-nav.css', './header.component.css']
})
export class HeaderComponent {
   private readonly auth = inject(AuthService);
  get profile() { return this.auth.currentUser(); }

  constructor(private router: Router){
  }

  signOut(){


    this.auth.signOut()
    this.router.navigate(['/admin/sign-in'])
  }

}
