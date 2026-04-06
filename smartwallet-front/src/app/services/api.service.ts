import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { ToastService } from '../shared/toast.service';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiError {
  status: number;
  message: string;
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
  private toast = inject(ToastService);
  private baseUrl = 'http://localhost:8080/api';

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: any, defaultMsg = 'Algo deu errado') {
    const message = error?.error?.message || error?.message || defaultMsg;
    this.toast.error(message);
    return throwError(() => ({ status: error?.status, message }));
  }

  // WALLETS
  getWallets(): Observable<Wallet[]> {
    return this.http.get<ApiResponse<Wallet[]>>(`${this.baseUrl}/wallets`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<Wallet[]>) => res.data as Wallet[]));
  }

  getWallet(id: number): Observable<Wallet> {
    return this.http.get<ApiResponse<Wallet>>(`${this.baseUrl}/wallets/${id}`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<Wallet>) => res.data as Wallet));
  }

  createWallet(data: any): Observable<Wallet> {
    return this.http.post<ApiResponse<Wallet>>(`${this.baseUrl}/wallets`, data, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<Wallet>) => res.data as Wallet));
  }

  updateWallet(id: number, data: any): Observable<Wallet> {
    return this.http.put<ApiResponse<Wallet>>(`${this.baseUrl}/wallets/${id}`, data, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<Wallet>) => res.data as Wallet));
  }

  deleteWallet(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/wallets/${id}`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<void>) => res.data as void));
  }

  // ASSETS
  getAssets(walletId: number): Observable<Asset[]> {
    return this.http.get<ApiResponse<Asset[]>>(`${this.baseUrl}/assets?walletId=${walletId}`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<Asset[]>) => res.data as Asset[]));
  }

  getAsset(id: number): Observable<Asset> {
    return this.http.get<ApiResponse<Asset>>(`${this.baseUrl}/assets/${id}`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<Asset>) => res.data as Asset));
  }

  createAsset(data: any): Observable<Asset> {
    return this.http.post<ApiResponse<Asset>>(`${this.baseUrl}/assets`, data, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<Asset>) => res.data as Asset));
  }

  updateAsset(id: number, data: any): Observable<Asset> {
    return this.http.put<ApiResponse<Asset>>(`${this.baseUrl}/assets/${id}`, data, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<Asset>) => res.data as Asset));
  }

  updateAssetPrice(id: number, price: number): Observable<Asset> {
    return this.updateAsset(id, { currentPrice: price });
  }

  deleteAsset(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/assets/${id}`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<void>) => res.data as void));
  }

  // PORTFOLIO
  getWalletAssets(walletId: number): Observable<Asset[]> {
    return this.http.get<ApiResponse<Asset[]>>(`${this.baseUrl}/portfolio/wallets/${walletId}/assets`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<Asset[]>) => res.data as Asset[]));
  }

  addAsset(walletId: number, asset: Partial<Asset>): Observable<Asset> {
    return this.http.post<ApiResponse<Asset>>(`${this.baseUrl}/portfolio/wallets/${walletId}/assets`, asset, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<Asset>) => res.data as Asset));
  }

  getAssetTransactions(assetId: number): Observable<Transaction[]> {
    return this.http.get<ApiResponse<Transaction[]>>(`${this.baseUrl}/portfolio/assets/${assetId}/transactions`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<Transaction[]>) => res.data as Transaction[]));
  }

  addTransaction(assetId: number, transaction: Partial<Transaction>): Observable<Transaction> {
    return this.http.post<ApiResponse<Transaction>>(`${this.baseUrl}/portfolio/assets/${assetId}/transactions`, transaction, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<Transaction>) => res.data as Transaction));
  }

  getPortfolioSummary(): Observable<PortfolioSummary> {
    return this.http.get<ApiResponse<PortfolioSummary>>(`${this.baseUrl}/portfolio/summary`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<PortfolioSummary>) => res.data as PortfolioSummary));
  }

  // AI
  analyzePortfolio(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/ai/analyze`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<any>) => res.data as any));
  }

  getRiskMetrics(): Observable<RiskMetrics> {
    return this.http.get<ApiResponse<RiskMetrics>>(`${this.baseUrl}/ai/risk`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<RiskMetrics>) => res.data as RiskMetrics));
  }

  getPortfolioScore(): Observable<ScoreMetrics> {
    return this.http.get<ApiResponse<ScoreMetrics>>(`${this.baseUrl}/ai/score`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<ScoreMetrics>) => res.data as ScoreMetrics));
  }

  getRecommendations(): Observable<Recommendation[]> {
    return this.http.get<ApiResponse<Recommendation[]>>(`${this.baseUrl}/ai/recommendations`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<Recommendation[]>) => res.data as Recommendation[]));
  }

  // MARKET
  getQuote(symbol: string): Observable<MarketQuote | null> {
    return this.http.get<ApiResponse<MarketQuote>>(`${this.baseUrl}/market/quote/${symbol}`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<MarketQuote>) => res.success ? res.data as MarketQuote : null));
  }

  getQuotes(symbols: string[]): Observable<MarketQuote[]> {
    return this.http.post<ApiResponse<MarketQuote[]>>(`${this.baseUrl}/market/quotes`, symbols, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<MarketQuote[]>) => res.data as MarketQuote[]));
  }

  getMarketStatus(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/market/status`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<any>) => res.data as any));
  }
}