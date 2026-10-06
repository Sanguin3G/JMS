import { Component, DestroyRef, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from 'src/app/core/auth/auth.service';
@Component({ standalone: false, selector: 'candidate-header', templateUrl: './header.component.html', styleUrls: ['../../../../shared/workspace-nav.css'] })
export class HeaderComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  menuOpen = false;
  get profile() { return this.auth.isRole('candidate') ? this.auth.currentUser() : null; }
  constructor() { this.router.events.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(event => { if (event instanceof NavigationEnd) this.menuOpen = false; }); }
  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  signOut(): void { this.auth.signOut(); void this.router.navigate(['/candidate/sign-in']); }
}
