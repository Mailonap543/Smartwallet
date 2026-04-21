import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { ToastService } from '../shared/toast.service';
import { AuthService } from './auth.service';

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
  id?: number;
  symbol: string;
  name: string;
  assetType?: string;
  quantity?: number;
  purchasePrice?: number;
  averagePrice?: number;
  currentPrice?: number;
  purchaseDate?: string;
  totalInvested?: number;
  currentValue?: number;
  profitLoss?: number;
  profitLossPercentage?: number;
  category?: { code: string; name: string };
  logoUrl?: string;
  website?: string;
  segment?: string;
  companyName?: string;
  description?: string;
  changePercent?: number;
  previousClose?: number;
  dayHigh?: number;
  dayLow?: number;
  dayVolume?: number;
  marketCap?: number;
  priceToEarnings?: number;
  priceToBook?: number;
  dividendYield?: number;
  roe?: number;
  revenue?: number;
  netIncome?: number;
  totalDebt?: number;
  cash?: number;
  high52w?: number;
  low52w?: number;
  lastQuoteAt?: string;
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
  private auth = inject(AuthService);
  private baseUrl = 'http://localhost:8080/api';

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken() || '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headers);
  }

  private handleError(error: any, defaultMsg = 'Algo deu errado') {
    const message = error?.error?.message || error?.message || defaultMsg;
    this.toast.error(message);
    return throwError(() => ({ status: error?.status, message }));
  }

  // WALLETS
  getWallets(): Observable<Wallet[]> {
    return this.http.get<ApiResponse<Wallet[]>>(`${this.baseUrl}/portfolio/wallets`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<Wallet[]>) => res.data as Wallet[]));
  }

  getWallet(id: number): Observable<Wallet> {
    return this.http.get<ApiResponse<Wallet>>(`${this.baseUrl}/portfolio/wallets/${id}`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<Wallet>) => res.data as Wallet));
  }

  createWallet(data: { name: string; description?: string } | string): Observable<Wallet> {
    const payload = typeof data === 'string' ? { name: data } : data;
    return this.http.post<ApiResponse<Wallet>>(`${this.baseUrl}/portfolio/wallets`, payload, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<Wallet>) => res.data as Wallet));
  }

  updateWallet(id: number, data: any): Observable<Wallet> {
    return this.http.put<ApiResponse<Wallet>>(`${this.baseUrl}/portfolio/wallets/${id}`, data, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<Wallet>) => res.data as Wallet));
  }

  deleteWallet(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/portfolio/wallets/${id}`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<void>) => res.data as void));
  }

  // ASSETS
  getAssets(walletId: number): Observable<Asset[]> {
    return this.http.get<ApiResponse<Asset[]>>(`${this.baseUrl}/portfolio/wallets/${walletId}/assets`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<Asset[]>) => res.data as Asset[]));
  }

  // MARKET
  getAssetBySymbol(symbol: string): Observable<Asset> {
    return this.http.get<ApiResponse<Asset>>(`${this.baseUrl}/market/assets/${symbol}`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<Asset>) => res.data as Asset));
  }

  getFeatured(): Observable<Asset[]> {
    return this.http.get<ApiResponse<Asset[]>>(`${this.baseUrl}/market/featured`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<Asset[]>) => res.data as Asset[]));
  }

  getTrending(): Observable<Asset[]> {
    return this.http.get<ApiResponse<Asset[]>>(`${this.baseUrl}/market/trending`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<Asset[]>) => res.data as Asset[]));
  }

  getCategories(): Observable<{code: string; name: string}[]> {
    return this.http.get<ApiResponse<{code: string; name: string}[]>>(`${this.baseUrl}/market/categories`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<{code: string; name: string}[]>) => res.data as {code: string; name: string}[]));
  }

  getFactsBySymbol(symbol: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/market/facts/${symbol}`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<any[]>) => res.data as any[]));
  }

  getDividendsBySymbol(symbol: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/market/assets/${symbol}/dividends`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<any[]>) => res.data as any[]));
  }

  getEarningsBySymbol(symbol: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/market/assets/${symbol}/earnings`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<any[]>) => res.data as any[]));
  }

  getHistory(symbol: string, period = '3M'): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/market/assets/${symbol}/history?period=${period}`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<any[]>) => res.data as any[]));
  }

  getNews(page = 0, size = 20): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/news?page=${page}&size=${size}`, { headers: this.getAuthHeaders() })
      .pipe(map((res: ApiResponse<any>) => res.data));
  }

  searchMarket(query: string, category?: string, page = 0, size = 20): Observable<{content: Asset[]; totalElements: number; totalPages: number}> {
    let url = `${this.baseUrl}/market/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`;
    if (category) url += `&category=${category}`;
    return this.http.get<ApiResponse<{content: Asset[]; totalElements: number; totalPages: number}>>(url, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data));
  }

  getRankings(category?: string, page = 0, size = 10): Observable<Record<string, Asset[]>> {
    let url = `${this.baseUrl}/market/rankings?page=${page}&size=${size}`;
    if (category) url += `&category=${category}`;
    return this.http.get<any>(url, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data as Record<string, Asset[]>));
  }

  getRankingByType(type: string, page = 0, size = 20): Observable<Asset[]> {
    return this.http.get<any>(`${this.baseUrl}/market/rankings/${type}?page=${page}&size=${size}`, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data as Asset[]));
  }

  getAssetHistory(symbol: string, period = '3M'): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/market/assets/${symbol}/history?period=${period}`, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data as any[]));
  }

  getAssetDividends(symbol: string): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/market/assets/${symbol}/dividends`, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data as any[]));
  }

  getAssetEarnings(symbol: string): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/market/assets/${symbol}/earnings`, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data as any[]));
  }

  runScreener(filters: any): Observable<Asset[]> {
    return this.http.post<any>(`${this.baseUrl}/market/screener`, filters, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data as Asset[]));
  }

  getScreenerPresets(): Observable<Record<string, {name: string; description: string}>> {
    return this.http.get<any>(`${this.baseUrl}/market/screener/presets`, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data as Record<string, {name: string; description: string}>));
  }

  // GOALS
  getGoals(walletId: number): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/portfolio/wallets/${walletId}/goals`, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data as any[]));
  }

  createGoal(walletId: number, goal: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/portfolio/wallets/${walletId}/goals`, goal, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data));
  }

  updateGoal(goalId: number, goal: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/portfolio/goals/${goalId}`, goal, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data));
  }

  deleteGoal(goalId: number): Observable<void> {
    return this.http.delete<any>(`${this.baseUrl}/portfolio/goals/${goalId}`, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data));
  }

  // DIVIDENDS
  getDividends(walletId: number): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/portfolio/wallets/${walletId}/dividends`, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data as any[]));
  }

  // BENCHMARK
  getBenchmark(walletId: number, period: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/portfolio/wallets/${walletId}/benchmark?period=${period}`, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data));
  }

  // AI ANALYSES
  analyzeAsset(symbol: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ai/analyze-asset`, { symbol }, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data));
  }

  compareAssets(symbols: string[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ai/compare-assets`, { symbols }, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data));
  }

  explainIndicator(indicator: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/ai/explain-indicator?indicator=${indicator}`, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data));
  }

  // ALERTS
  getAlerts(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/alerts`, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data as any[]));
  }

  createAlert(alert: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/alerts`, alert, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data));
  }

  deleteAlert(alertId: number): Observable<void> {
    return this.http.delete<any>(`${this.baseUrl}/alerts/${alertId}`, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data));
  }

  // WATCHLIST & FAVORITES
  getFavorites(): Observable<Asset[]> {
    return this.http.get<any>(`${this.baseUrl}/watchlist/favorites`, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data as Asset[]));
  }

  addFavorite(symbol: string): Observable<void> {
    return this.http.post<any>(`${this.baseUrl}/watchlist/favorite/${symbol}`, {}, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data));
  }

  removeFavorite(symbol: string): Observable<void> {
    return this.http.delete<any>(`${this.baseUrl}/watchlist/favorite/${symbol}`, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data));
  }

  getWatchlists(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/watchlist`, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data));
  }

  createWatchlist(name: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/watchlist`, { name }, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data));
  }

  getWatchlistItems(watchlistId: number): Observable<Asset[]> {
    return this.http.get<any>(`${this.baseUrl}/watchlist/${watchlistId}/items`, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data as Asset[]));
  }

  addToWatchlist(watchlistId: number, symbol: string): Observable<void> {
    return this.http.post<any>(`${this.baseUrl}/watchlist/${watchlistId}/items`, { symbol }, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data));
  }

  removeFromWatchlist(watchlistId: number, symbol: string): Observable<void> {
    return this.http.delete<any>(`${this.baseUrl}/watchlist/${watchlistId}/items/${symbol}`, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res.data));
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
