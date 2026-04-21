import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

export interface Plan {
  name: string;
  displayName: string;
  description: string;
  monthlyPrice: number;
  maxWallets: number;
  maxAssets: number;
  aiAnalysis: boolean;
  realTimePrices: boolean;
  bankIntegration: boolean;
  advancedReports: boolean;
  dataHistoryDays: number;
}

export interface PlanFeatures {
  plan: Plan;
  maxWallets: number;
  maxAssets: number;
  aiAnalysis: boolean;
  realTimePrices: boolean;
  bankIntegration: boolean;
  advancedReports: boolean;
  dataHistoryDays: number;
  availableFeatures: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private baseUrl = 'http://localhost:8080/api';

  private getHeaders() {
    return this.auth.getAuthHeaders();
  }

  getAvailablePlans(): Observable<Plan[]> {
    return this.http.get<any>(`${this.baseUrl}/subscription/plans`, { headers: this.getHeaders() })
      .pipe(map(res => res.data));
  }

  getMyPlan(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/subscription/my-plan`, { headers: this.getHeaders() })
      .pipe(map(res => res.data));
  }

  getMyPlanFeatures(): Observable<PlanFeatures> {
    return this.http.get<any>(`${this.baseUrl}/subscription/features`, { headers: this.getHeaders() })
      .pipe(map(res => res.data));
  }

  upgradePlan(planName: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/subscription/upgrade`, { plan: planName }, { headers: this.getHeaders() });
  }

  cancelSubscription(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/subscription/cancel`, {}, { headers: this.getHeaders() });
  }

  checkFeatureAccess(feature: string): Observable<boolean> {
    const endpoint = this.getFeatureEndpoint(feature);
    return this.http.get<any>(`${this.baseUrl}/subscription/check/${endpoint}`, { headers: this.getHeaders() })
      .pipe(map(res => res.data?.allowed || false));
  }

  private getFeatureEndpoint(feature: string): string {
    switch (feature) {
      case 'wallet': return 'wallet';
      case 'asset': return 'asset';
      case 'ai': return 'ai';
      case 'bank': return 'bank';
      default: return 'wallet';
    }
  }
}