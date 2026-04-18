import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, map, throwError } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  cpf?: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
  user: {
    id: number;
    email: string;
    fullName: string;
    role?: string;
  };
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  role?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

interface JwtPayload {
  exp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  
  private userSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);
  private loadingSignal = signal<boolean>(false);

  user = computed(() => this.userSignal());
  isAuthenticated = computed(() => this.isAccessTokenUsable(this.tokenSignal()));
  isLoading = computed(() => this.loadingSignal());

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredAuth();
  }

  private isTokenValid(token: string | null): token is string {
    return !!token && token.trim().length > 0 && token !== 'undefined' && token !== 'null';
  }

  private decodeJwtPayload(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      return JSON.parse(atob(paddedBase64)) as JwtPayload;
    } catch {
      return null;
    }
  }

  private isJwtExpired(token: string): boolean {
    const payload = this.decodeJwtPayload(token);
    if (!payload || typeof payload.exp !== 'number') {
      return false;
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp <= nowInSeconds;
  }

  private isAccessTokenUsable(token: string | null): token is string {
    return this.isTokenValid(token) && !this.isJwtExpired(token);
  }

  private parseStoredUser(userStr: string | null): User | null {
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      return null;
    }

    try {
      const parsed = JSON.parse(userStr) as Partial<User> | null;
      if (!parsed || typeof parsed !== 'object') {
        return null;
      }

      if (typeof parsed.id !== 'number' || typeof parsed.email !== 'string' || typeof parsed.fullName !== 'string') {
        return null;
      }

      return {
        id: parsed.id,
        email: parsed.email,
        fullName: parsed.fullName,
        role: typeof parsed.role === 'string' ? parsed.role : 'USER'
      };
    } catch {
      return null;
    }
  }

  private clearStoredAuth(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.tokenSignal.set(null);
    this.userSignal.set(null);
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem('accessToken');
    const user = this.parseStoredUser(localStorage.getItem('user'));

    if (this.isAccessTokenUsable(token) && user) {
      localStorage.setItem('accessToken', token);
      this.tokenSignal.set(token);
      this.userSignal.set(user);
      return;
    }

    this.clearStoredAuth();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.loadingSignal.set(true);
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials).pipe(
      map((response: ApiResponse<AuthResponse>) => response.data),
      tap(response => {
        this.handleAuthSuccess(response);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    this.loadingSignal.set(true);
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, data).pipe(
      map((response: ApiResponse<AuthResponse>) => response.data),
      tap(response => {
        this.handleAuthSuccess(response);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<AuthResponse | null> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!this.isTokenValid(refreshToken)) {
      return of(null);
    }

    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      map((response: ApiResponse<AuthResponse>) => response.data),
      tap(response => this.handleAuthSuccess(response)),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  getToken(): string | null {
    const token = this.tokenSignal() || localStorage.getItem('accessToken');

    if (!this.isAccessTokenUsable(token)) {
      if (this.isTokenValid(token)) {
        this.clearStoredAuth();
      }
      return null;
    }

    if (this.tokenSignal() !== token) {
      this.tokenSignal.set(token);
    }

    return token;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.isTokenValid(token)) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headers);
  }

  private handleAuthSuccess(response: AuthResponse): void {
    if (!this.isTokenValid(response?.accessToken) || !this.isTokenValid(response?.refreshToken) || !response?.user) {
      this.clearStoredAuth();
      throw new Error('Resposta de autenticação inválida');
    }

    const normalizedUser: User = {
      id: response.user.id,
      email: response.user.email,
      fullName: response.user.fullName,
      role: response.user.role || 'USER'
    };

    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    localStorage.removeItem('token');
    this.tokenSignal.set(response.accessToken);
    this.userSignal.set(normalizedUser);
  }
}
