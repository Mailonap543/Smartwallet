import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

function isAuthEndpoint(url: string): boolean {
  return (
    url.includes('/api/auth/login') ||
    url.includes('/api/auth/register') ||
    url.includes('/api/auth/refresh') ||
    url.includes('/api/auth/forgot-password') ||
    url.includes('/api/auth/reset-password')
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const requestIsAuthEndpoint = isAuthEndpoint(req.url);
  const token = auth.getToken();

  const request = !requestIsAuthEndpoint && token && !req.headers.has('Authorization')
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || requestIsAuthEndpoint) {
        return throwError(() => error);
      }

      return auth.refreshToken().pipe(
        switchMap((response) => {
          const refreshedToken = response?.accessToken || auth.getToken();
          if (!refreshedToken) {
            auth.logout();
            return throwError(() => error);
          }

          const retryRequest = req.clone({
            setHeaders: {
              Authorization: `Bearer ${refreshedToken}`
            }
          });

          return next(retryRequest);
        }),
        catchError(() => {
          auth.logout();
          return throwError(() => error);
        })
      );
    })
  );
};
