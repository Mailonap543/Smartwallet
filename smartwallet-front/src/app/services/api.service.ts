import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface Wallet {
  id: number;
  name: string;
  description?: string;
  totalBalance: number;
  totalInvested: number;
  totalProfitLoss: number;
  createdAt: string;
}

export interface Asset {
  id: number;
  symbol: string;
  name: string;
  assetType: string;
  quantity: number;
  purchasePrice: number;
  averagePrice?: number;
  currentPrice?: number;
  purchaseDate: string;
  totalInvested?: number;
  currentValue?: number;
  profitLoss?: number;
  profitLossPercentage?: number;
}

export interface Transaction {
  id: number;
  transactionType: 'BUY' | 'SELL' | 'DIVIDEND';
  quantity: number;
  price: number;
  totalValue: number;
  fees?: number;
  transactionDate: string;
  notes?: string;
}

export interface PortfolioSummary {
  totalInvested: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  walletCount: number;
  assetCount: number;
  byType: { type: string; totalValue: number; assetCount: number }[];
}

export interface RiskMetrics {
  portfolioVolatility: number;
  sharpeRatio: number;
  beta: number;
  maxDrawdown: number;
  var95: number;
  riskScore: number;
  riskLevel: string;
}

export interface ScoreMetrics {
  overallScore: number;
  diversificationScore: number;
  riskReturnScore: number;
  liquidityScore: number;
  concentrationScore: number;
  stabilityScore: number;
  recommendations: string[];
}

export interface Recommendation {
  type: string;
  title: string;
  description: string;
  priority: number;
  potentialImpact?: number;
  actionRequired: string;
}

export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change?: number;
  changePercent?: number;
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
  lastUpdate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private baseUrl = 'http://localhost:8080/api';

  private getHeaders() {
    return this.auth.getAuthHeaders();
  }

  // Portfolio endpoints
  getWallets(): Observable<Wallet[]> {
    return this.http.get<ApiResponse<Wallet[]>>(`${this.baseUrl}/portfolio/wallets`, { headers: this.getHeaders() })
      .pipe(map(res => res.data));
  }

  getWallet(id: number): Observable<Wallet> {
    return this.http.get<ApiResponse<Wallet>>(`${this.baseUrl}/portfolio/wallets/${id}`, { headers: this.getHeaders() })
      .pipe(map(res => res.data));
  }

  createWallet(name: string, description?: string): Observable<Wallet> {
    return this.http.post<ApiResponse<Wallet>>(`${this.baseUrl}/portfolio/wallets`, { name, description }, { headers: this.getHeaders() })
      .pipe(map(res => res.data));
  }

  getWalletAssets(walletId: number): Observable<Asset[]> {
    return this.http.get<ApiResponse<Asset[]>>(`${this.baseUrl}/portfolio/wallets/${walletId}/assets`, { headers: this.getHeaders() })
      .pipe(map(res => res.data));
  }

  addAsset(walletId: number, asset: Partial<Asset>): Observable<Asset> {
    return this.http.post<ApiResponse<Asset>>(`${this.baseUrl}/portfolio/wallets/${walletId}/assets`, asset, { headers: this.getHeaders() })
      .pipe(map(res => res.data));
  }

  updateAssetPrice(assetId: number, currentPrice: number): Observable<Asset> {
    return this.http.put<ApiResponse<Asset>>(`${this.baseUrl}/portfolio/assets/${assetId}/price`, { currentPrice }, { headers: this.getHeaders() })
      .pipe(map(res => res.data));
  }

  deleteAsset(assetId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/portfolio/assets/${assetId}`, { headers: this.getHeaders() });
  }

  getAssetTransactions(assetId: number): Observable<Transaction[]> {
    return this.http.get<ApiResponse<Transaction[]>>(`${this.baseUrl}/portfolio/assets/${assetId}/transactions`, { headers: this.getHeaders() })
      .pipe(map(res => res.data));
  }

  addTransaction(assetId: number, transaction: Partial<Transaction>): Observable<Transaction> {
    return this.http.post<ApiResponse<Transaction>>(`${this.baseUrl}/portfolio/assets/${assetId}/transactions`, transaction, { headers: this.getHeaders() })
      .pipe(map(res => res.data));
  }

  getPortfolioSummary(): Observable<PortfolioSummary> {
    return this.http.get<ApiResponse<PortfolioSummary>>(`${this.baseUrl}/portfolio/summary`, { headers: this.getHeaders() })
      .pipe(map(res => res.data));
  }

  // AI endpoints
  analyzePortfolio(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/ai/analyze`, { headers: this.getHeaders() })
      .pipe(map(res => res.data));
  }

  getRiskMetrics(): Observable<RiskMetrics> {
    return this.http.get<ApiResponse<RiskMetrics>>(`${this.baseUrl}/ai/risk`, { headers: this.getHeaders() })
      .pipe(map(res => res.data));
  }

  getPortfolioScore(): Observable<ScoreMetrics> {
    return this.http.get<ApiResponse<ScoreMetrics>>(`${this.baseUrl}/ai/score`, { headers: this.getHeaders() })
      .pipe(map(res => res.data));
  }

  getRecommendations(): Observable<Recommendation[]> {
    return this.http.get<ApiResponse<Recommendation[]>>(`${this.baseUrl}/ai/recommendations`, { headers: this.getHeaders() })
      .pipe(map(res => res.data));
  }

  // Market endpoints
  getQuote(symbol: string): Observable<MarketQuote | null> {
    return this.http.get<ApiResponse<MarketQuote>>(`${this.baseUrl}/market/quote/${symbol}`, { headers: this.getHeaders() })
      .pipe(
        map(res => res.success ? res.data : null),
        catchError(() => null as any)
      );
  }

  getQuotes(symbols: string[]): Observable<MarketQuote[]> {
    return this.http.post<ApiResponse<MarketQuote[]>>(`${this.baseUrl}/market/quotes`, symbols, { headers: this.getHeaders() })
      .pipe(map(res => res.data));
  }

  getMarketStatus(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/market/status`, { headers: this.getHeaders() })
      .pipe(map(res => res.data));
  }
}