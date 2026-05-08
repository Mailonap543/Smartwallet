import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

function canAccessProtectedRoute(): boolean {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.getToken()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
}

export const authGuard: CanActivateFn = () => canAccessProtectedRoute();
