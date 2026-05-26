import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { BankPaymentResponse } from './api.service';

export interface Plan {
  name: string;
  displayName: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  annualDiscountPercent: number;
  maxWallets: number;
  maxAssets: number;
  aiAnalysis: boolean;
  realTimePrices: boolean;
  bankIntegration: boolean;
  advancedReports: boolean;
  dataHistoryDays: number;
  features: string[];
  unavailableFeatures: string[];
  highlighted: boolean;
  accentColor: string;
  displayOrder: number;
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

export interface PlanCheckoutResponse {
  plan: Plan;
  payment: BankPaymentResponse | null;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  amount: number;
}

export interface AdminPlanUpdate {
  displayName?: string;
  description?: string;
  monthlyPrice?: number;
  annualDiscountPercent?: number;
  highlighted?: boolean;
  accentColor?: string;
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private baseUrl = `${environment.apiUrl}/api`;
  private adminBaseUrl = `${environment.apiUrl}/api/v1/admin`;

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

  checkoutPlan(planName: string, billingCycle: 'MONTHLY' | 'ANNUAL', institutionId: string): Observable<PlanCheckoutResponse> {
    return this.http.post<any>(
      `${this.baseUrl}/subscription/checkout`,
      { plan: planName, billingCycle, institutionId },
      { headers: this.getHeaders() }
    ).pipe(map(res => ({
      ...res.data,
      payment: res.data.payment ? this.mapPayment(res.data.payment) : null
    }) as PlanCheckoutResponse));
  }

  getAdminPlans(): Observable<Plan[]> {
    return this.http.get<any>(`${this.adminBaseUrl}/plans`, { headers: this.getHeaders() })
      .pipe(map(res => res.data as Plan[]));
  }

  updateAdminPlan(planName: string, data: AdminPlanUpdate): Observable<Plan> {
    return this.http.put<any>(`${this.adminBaseUrl}/plans/${planName}`, data, { headers: this.getHeaders() })
      .pipe(map(res => res.data as Plan));
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

  private mapPayment(raw: any): BankPaymentResponse {
    return {
      paymentId: raw.paymentId ?? raw.payment_id,
      status: raw.status,
      institutionId: raw.institutionId ?? raw.institution_id,
      institutionName: raw.institutionName ?? raw.institution_name,
      amount: raw.amount,
      currency: raw.currency,
      method: raw.method,
      checkoutUrl: raw.checkoutUrl ?? raw.checkout_url,
      pixCopyPaste: raw.pixCopyPaste ?? raw.pix_copy_paste,
      message: raw.message,
      createdAt: raw.createdAt ?? raw.created_at
    };
  }
}
