import { Component, DestroyRef, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from 'src/app/core/auth/auth.service';
@Component({ standalone: false, selector: 'app-header-recruiter', templateUrl: './header.component.html', styleUrls: ['../../../../shared/workspace-nav.css'] })
export class HeaderComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly profile = this.auth.currentUser;
  menuOpen = false;
  get hasCompany(): boolean { return !!this.profile()?.companyId; }
  constructor() { this.router.events.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(event => { if (event instanceof NavigationEnd) this.menuOpen = false; }); }
  signOut(): void { this.auth.signOut(); void this.router.navigate(['/recruiter']); }
}
