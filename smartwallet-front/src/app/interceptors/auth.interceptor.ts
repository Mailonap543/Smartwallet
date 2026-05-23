// smartwallet-front/src/app/interceptors/auth.interceptor.ts

import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

function withBearerToken(req: HttpRequest<unknown>, token: string) {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function isAuthEndpoint(url: string): boolean {
  return (
    url.includes('/api/auth/login') ||
    url.includes('/api/auth/register') ||
    url.includes('/api/auth/refresh') ||
    url.includes('/api/auth/forgot-password') ||
    url.includes('/api/auth/reset-password')
  );
}

function isOptionalMarketNotFound(error: unknown, url: string): boolean {
  return error instanceof HttpErrorResponse
    && error.status === 404
    && (
      url.includes('/api/market/favorites')
      || url.includes('/api/v1/alerts')
      || url.includes('/api/notifications')
      || url.includes('/api/market/facts/')
      || /\/api\/market\/assets\/[^/]+$/.test(url)
      || url.includes('/dividends')
      || url.includes('/earnings')
      || url.includes('/history')
    );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const requestIsAuthEndpoint = isAuthEndpoint(req.url);

  console.log('🔐 [AuthInterceptor] URL:', req.url);
  console.log('🔐 [AuthInterceptor] isAuthEndpoint:', requestIsAuthEndpoint);

  // Se é endpoint de auth, deixa passar sem token
  if (requestIsAuthEndpoint) {
    console.log('✅ [AuthInterceptor] Auth endpoint - sem token necessário');
    return next(req);
  }

  // Para requisições protegidas, SEMPRE tenta pegar o token
  const token = auth.getToken();
  console.log('🔐 [AuthInterceptor] Token recuperado:', token ? '✅ Presente' : '❌ Ausente');

  let request = req;

  // Se tem token e não tem header de autorização, adiciona
  if (token && !req.headers.has('Authorization')) {
    console.log('➕ [AuthInterceptor] Adicionando Authorization header');
    request = withBearerToken(req, token);
  } else if (!token) {
    console.warn('⚠️ [AuthInterceptor] Nenhum token disponível para requisição protegida!');
  }

  // Envia a requisição
  return next(request).pipe(
    catchError((error: unknown) => {
      // Se não é erro 401 ou é auth endpoint, passa o erro adiante
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || requestIsAuthEndpoint) {
        if (!isOptionalMarketNotFound(error, request.url)) {
          console.error('❌ [AuthInterceptor] Erro:', error instanceof HttpErrorResponse ? error.status : 'desconhecido');
        }
        return throwError(() => error);
      }

      // Se é 401, tenta fazer refresh do token
      console.warn('🔄 [AuthInterceptor] 401 recebido - tentando refresh token');

      return auth.refreshToken().pipe(
        switchMap((response) => {
          const refreshedToken = response?.accessToken || auth.getToken();

          if (!refreshedToken) {
            console.error('❌ [AuthInterceptor] Refresh falhou - token não obtido');
            auth.logout();
            return throwError(() => error);
          }

          console.log('✅ [AuthInterceptor] Refresh bem-sucedido - retry requisição');

          const retryRequest = withBearerToken(req, refreshedToken);

          return next(retryRequest);
        }),
        catchError((refreshError) => {
          console.error('❌ [AuthInterceptor] Refresh/retry falhou:', refreshError);
          auth.logout();
          return throwError(() => refreshError);
        })
      );
    })
  );
};
