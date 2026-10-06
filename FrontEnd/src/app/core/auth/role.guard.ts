import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from './auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const role = (route.data['role'] ?? state.url.split('/')[1]) as UserRole;
  return inject(AuthService).isRole(role)
    ? true : router.createUrlTree([`/${role}/sign-in`], { queryParams: { returnUrl: state.url } });
};
