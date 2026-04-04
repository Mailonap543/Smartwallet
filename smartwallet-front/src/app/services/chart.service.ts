import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

export interface ChartDataResponse {
  dates: string[];
  portfolio: number[];
  cdi: number[];
  ibovespa: number[];
}

export interface PortfolioChartData {
  dates: string[];
  series: {
    name: string;
    data: number[];
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private baseUrl = 'http://localhost:8080/api';

  private getHeaders() {
    return this.auth.getAuthHeaders();
  }

  getPortfolioEvolution(days: number = 90): Observable<PortfolioChartData> {
    return this.http.get<any>(
      `${this.baseUrl}/portfolio/evolution?days=${days}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          const data = response.data;
          return {
            dates: data.dates || [],
            series: [
              { name: 'Portfólio', data: data.portfolio || [] },
              { name: 'CDI', data: data.cdi || [] },
              { name: 'Ibovespa', data: data.ibovespa || [] }
            ]
          };
        }
        return { dates: [], series: [] };
      })
    );
  }

  getAllocationByType(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/portfolio/allocation`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          const data = response.data;
          return {
            series: data.map((item: any) => item.totalValue),
            labels: data.map((item: any) => item.type)
          };
        }
        return { series: [], labels: [] };
      })
    );
  }

  getPerformanceByAsset(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/portfolio/performance`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data.map((item: any) => ({
            x: item.symbol,
            y: item.profitLossPercentage
          }));
        }
        return [];
      })
    );
  }

  getDividendHistory(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/portfolio/dividends`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return {
            dates: response.data.dates || [],
            values: response.data.values || []
          };
        }
        return { dates: [], values: [] };
      })
    );
  }
}