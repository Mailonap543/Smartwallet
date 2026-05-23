import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError, of } from 'rxjs';
import { ToastService } from '../shared/toast.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

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

export interface JarvisChatRequest {
  message: string;
  sessionId?: string;
}

export interface JarvisChatResponse {
  reply: string;
  sessionId: string;
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

export interface NotificationItem {
  id: number;
  userId: number;
  type: 'MARKET_PRICE' | 'RISK_ALERT' | 'NEWS' | 'SYSTEM';
  title: string;
  message?: string;
  isRead: boolean;
  createdAt: string;
}

interface LegacyAlert {
  id: number;
  userId: number;
  assetSymbol?: string;
  alertType?: string;
  conditionType?: string;
  targetValue?: number;
  active?: boolean;
  isActive?: boolean;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private auth = inject(AuthService);
  private baseUrl = environment.apiUrl + '/api';

  private handleError(error: any, defaultMsg = 'Algo deu errado') {
    const message = error?.error?.message || error?.message || defaultMsg;
    console.error('🔴 API Error:', message, error);
    this.toast.error(message);
    return throwError(() => ({ status: error?.status, message }));
  }

  private optionalArray<T>(error: any): Observable<T[]> {
    if (error?.status === 404) {
      return of([]);
    }
    return this.handleError(error);
  }

  getWallets(): Observable<Wallet[]> {
    console.log('📤 GET /portfolio/wallets');
    return this.http.get<ApiResponse<Wallet[]>>(`${this.baseUrl}/portfolio/wallets`)
      .pipe(
        map((res: ApiResponse<Wallet[]>) => res.data as Wallet[]),
        catchError(err => this.handleError(err, 'Erro ao carregar wallets'))
      );
  }

  getWallet(id: number): Observable<Wallet> {
    return this.http.get<ApiResponse<Wallet>>(`${this.baseUrl}/portfolio/wallets/${id}`)
      .pipe(
        map((res: ApiResponse<Wallet>) => res.data as Wallet),
        catchError(err => this.handleError(err))
      );
  }

  createWallet(data: { name: string; description?: string } | string): Observable<Wallet> {
    const payload = typeof data === 'string' ? { name: data } : data;
    console.log('📤 POST /portfolio/wallets', payload);
    return this.http.post<ApiResponse<Wallet>>(`${this.baseUrl}/portfolio/wallets`, payload)
      .pipe(
        map((res: ApiResponse<Wallet>) => res.data as Wallet),
        catchError(err => this.handleError(err))
      );
  }

  updateWallet(id: number, data: any): Observable<Wallet> {
    return this.http.put<ApiResponse<Wallet>>(`${this.baseUrl}/portfolio/wallets/${id}`, data)
      .pipe(
        map((res: ApiResponse<Wallet>) => res.data as Wallet),
        catchError(err => this.handleError(err))
      );
  }

  deleteWallet(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/portfolio/wallets/${id}`)
      .pipe(
        map((res: ApiResponse<void>) => res.data as void),
        catchError(err => this.handleError(err))
      );
  }

  getAssets(walletId: number): Observable<Asset[]> {
    console.log('📤 GET /portfolio/wallets/:id/assets');
    return this.http.get<ApiResponse<Asset[]>>(`${this.baseUrl}/portfolio/wallets/${walletId}/assets`)
      .pipe(
        map((res: ApiResponse<Asset[]>) => res.data as Asset[]),
        catchError(err => this.handleError(err))
      );
  }

  getWalletAssets(walletId: number): Observable<Asset[]> {
    return this.getAssets(walletId);
  }

  addAsset(walletId: number, assetData: any): Observable<Asset> {
    return this.http.post<ApiResponse<Asset>>(`${this.baseUrl}/portfolio/wallets/${walletId}/assets`, assetData)
      .pipe(
        map((res: ApiResponse<Asset>) => res.data as Asset),
        catchError(err => this.handleError(err))
      );
  }

  updateAsset(assetId: number, assetData: any): Observable<Asset> {
    return this.http.put<ApiResponse<Asset>>(`${this.baseUrl}/portfolio/assets/${assetId}`, assetData)
      .pipe(
        map((res: ApiResponse<Asset>) => res.data as Asset),
        catchError(err => this.handleError(err))
      );
  }

  updateAssetPrice(assetId: number, price: number): Observable<Asset> {
    return this.http.put<ApiResponse<Asset>>(`${this.baseUrl}/portfolio/assets/${assetId}/price`, { currentPrice: price })
      .pipe(
        map((res: ApiResponse<Asset>) => res.data as Asset),
        catchError(err => this.handleError(err))
      );
  }

  deleteAsset(assetId: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/portfolio/assets/${assetId}`)
      .pipe(
        map((res: ApiResponse<void>) => res.data as void),
        catchError(err => this.handleError(err))
      );
  }

  getAssetBySymbol(symbol: string): Observable<Asset> {
    return this.http.get<ApiResponse<Asset>>(`${this.baseUrl}/market/assets/${symbol}`)
      .pipe(
        map((res: ApiResponse<Asset>) => res.data as Asset),
        catchError(err => {
          if (err?.status === 404) {
            return of({
              symbol,
              name: symbol,
              currentPrice: 0,
              changePercent: 0
            } as Asset);
          }
          return this.handleError(err);
        })
      );
  }

  getFeatured(): Observable<Asset[]> {
    return this.http.get<ApiResponse<Asset[]>>(`${this.baseUrl}/market/featured`)
      .pipe(
        map((res: ApiResponse<Asset[]>) => res.data as Asset[]),
        catchError(err => this.handleError(err))
      );
  }

  getTrending(): Observable<Asset[]> {
    return this.http.get<ApiResponse<Asset[]>>(`${this.baseUrl}/market/trending`)
      .pipe(
        map((res: ApiResponse<Asset[]>) => res.data as Asset[]),
        catchError(err => this.handleError(err))
      );
  }

  getCategories(): Observable<{code: string; name: string}[]> {
    return this.http.get<ApiResponse<{code: string; name: string}[]>>(`${this.baseUrl}/market/categories`)
      .pipe(
        map((res: ApiResponse<{code: string; name: string}[]>) => res.data as {code: string; name: string}[]),
        catchError(err => this.handleError(err))
      );
  }

  getFactsBySymbol(symbol: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/market/facts/${symbol}`)
      .pipe(
        map((res: ApiResponse<any[]>) => res.data as any[]),
        catchError(err => this.optionalArray<any>(err))
      );
  }

  getDividendsBySymbol(symbol: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/market/assets/${symbol}/dividends`)
      .pipe(
        map((res: ApiResponse<any[]>) => res.data as any[]),
        catchError(err => this.optionalArray<any>(err))
      );
  }

  getEarningsBySymbol(symbol: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/market/assets/${symbol}/earnings`)
      .pipe(
        map((res: ApiResponse<any[]>) => res.data as any[]),
        catchError(err => this.optionalArray<any>(err))
      );
  }

  getHistory(symbol: string, period = '3M'): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/market/assets/${symbol}/history?period=${period}`)
      .pipe(
        map((res: ApiResponse<any[]>) => res.data as any[]),
        catchError(err => this.optionalArray<any>(err))
      );
  }

  getNews(page = 0, size = 20): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/news?page=${page}&size=${size}`)
      .pipe(
        map((res: ApiResponse<any>) => res.data),
        catchError(err => this.handleError(err))
      );
  }

  searchMarket(query: string, category?: string, page = 0, size = 20): Observable<{content: Asset[]; totalElements: number; totalPages: number}> {
    let url = `${this.baseUrl}/market/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`;
    if (category) url += `&category=${category}`;
    return this.http.get<ApiResponse<{content: Asset[]; totalElements: number; totalPages: number}>>(url)
      .pipe(
        map((res: any) => res.data),
        catchError(err => this.handleError(err))
      );
  }

  getRankings(category?: string, page = 0, size = 10): Observable<Record<string, Asset[]>> {
    let url = `${this.baseUrl}/market/rankings?page=${page}&size=${size}`;
    if (category) url += `&category=${category}`;
    return this.http.get<any>(url)
      .pipe(
        map((res: any) => res.data as Record<string, Asset[]>),
        catchError(err => this.handleError(err))
      );
  }

  getRankingByType(type: string, page = 0, size = 20): Observable<Asset[]> {
    return this.http.get<any>(`${this.baseUrl}/market/rankings/${type}?page=${page}&size=${size}`)
      .pipe(
        map((res: any) => res.data as Asset[]),
        catchError(err => this.handleError(err))
      );
  }

  getAssetHistory(symbol: string, period = '3M'): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/market/assets/${symbol}/history?period=${period}`)
      .pipe(
        map((res: any) => res.data as any[]),
        catchError(err => this.optionalArray<any>(err))
      );
  }

  getAssetDividends(symbol: string): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/market/assets/${symbol}/dividends`)
      .pipe(
        map((res: any) => res.data as any[]),
        catchError(err => this.optionalArray<any>(err))
      );
  }

  getAssetEarnings(symbol: string): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/market/assets/${symbol}/earnings`)
      .pipe(
        map((res: any) => res.data as any[]),
        catchError(err => this.optionalArray<any>(err))
      );
  }

  runScreener(filters: any): Observable<Asset[]> {
    return this.http.post<any>(`${this.baseUrl}/market/screener`, filters)
      .pipe(
        map((res: any) => res.data as Asset[]),
        catchError(err => this.handleError(err))
      );
  }

  getScreenerPresets(): Observable<Record<string, {name: string; description: string}>> {
    return this.http.get<any>(`${this.baseUrl}/market/screener/presets`)
      .pipe(
        map((res: any) => res.data as Record<string, {name: string; description: string}>),
        catchError(err => this.handleError(err))
      );
  }

  getGoals(walletId: number): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/portfolio/wallets/${walletId}/goals`)
      .pipe(
        map((res: any) => res.data as any[]),
        catchError(err => this.handleError(err))
      );
  }

  createGoal(walletId: number, goal: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/portfolio/wallets/${walletId}/goals`, goal)
      .pipe(
        map((res: any) => res.data),
        catchError(err => this.handleError(err))
      );
  }

  updateGoal(goalId: number, goal: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/portfolio/goals/${goalId}`, goal)
      .pipe(
        map((res: any) => res.data),
        catchError(err => this.handleError(err))
      );
  }

  deleteGoal(goalId: number): Observable<void> {
    return this.http.delete<any>(`${this.baseUrl}/portfolio/goals/${goalId}`)
      .pipe(
        map((res: any) => res.data),
        catchError(err => this.handleError(err))
      );
  }

  getDividends(walletId: number): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/portfolio/wallets/${walletId}/dividends`)
      .pipe(
        map((res: any) => res.data as any[]),
        catchError(err => this.handleError(err))
      );
  }

  getBenchmark(walletId: number, period: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/portfolio/wallets/${walletId}/benchmark?period=${period}`)
      .pipe(
        map((res: any) => res.data),
        catchError(err => this.handleError(err))
      );
  }

  analyzePortfolio(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/ai/analyze`)
      .pipe(
        map((res: ApiResponse<any>) => res.data as any),
        catchError(err => this.handleError(err))
      );
  }

  getPortfolioSummary(): Observable<PortfolioSummary> {
    console.log('📤 GET /portfolio/summary');
    return this.http.get<ApiResponse<PortfolioSummary>>(`${this.baseUrl}/portfolio/summary`)
      .pipe(
        map((res: ApiResponse<PortfolioSummary>) => res.data as PortfolioSummary),
        catchError(err => this.handleError(err, 'Erro ao carregar resumo do portfólio'))
      );
  }

  getRiskMetrics(): Observable<RiskMetrics> {
    return this.http.get<ApiResponse<RiskMetrics>>(`${this.baseUrl}/ai/risk`)
      .pipe(
        map((res: ApiResponse<RiskMetrics>) => res.data as RiskMetrics),
        catchError(err => this.handleError(err))
      );
  }

  getPortfolioScore(): Observable<ScoreMetrics> {
    return this.http.get<ApiResponse<ScoreMetrics>>(`${this.baseUrl}/ai/score`)
      .pipe(
        map((res: ApiResponse<ScoreMetrics>) => res.data as ScoreMetrics),
        catchError(err => this.handleError(err))
      );
  }

  getRecommendations(): Observable<Recommendation[]> {
    return this.http.get<ApiResponse<Recommendation[]>>(`${this.baseUrl}/ai/recommendations`)
      .pipe(
        map((res: ApiResponse<Recommendation[]>) => res.data as Recommendation[]),
        catchError(err => this.handleError(err))
      );
  }

  getQuote(symbol: string): Observable<MarketQuote | null> {
    return this.http.get<ApiResponse<MarketQuote>>(`${this.baseUrl}/market/quote/${symbol}`)
      .pipe(
        map((res: ApiResponse<MarketQuote>) => res.success ? res.data as MarketQuote : null),
        catchError(err => this.handleError(err))
      );
  }

  getQuotes(symbols: string[]): Observable<MarketQuote[]> {
    return this.http.post<ApiResponse<MarketQuote[]>>(`${this.baseUrl}/market/quotes`, symbols)
      .pipe(
        map((res: ApiResponse<MarketQuote[]>) => res.data as MarketQuote[]),
        catchError(err => this.handleError(err))
      );
  }

  getMarketStatus(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/market/status`)
      .pipe(
        map((res: ApiResponse<any>) => res.data as any),
        catchError(err => this.handleError(err))
      );
  }

  chatWithJarvis(payload: JarvisChatRequest): Observable<JarvisChatResponse> {
    return this.http.post<ApiResponse<JarvisChatResponse>>(`${this.baseUrl}/ai/chat`, payload)
      .pipe(
        map((res: ApiResponse<JarvisChatResponse>) => res.data as JarvisChatResponse),
        catchError(err => this.handleError(err))
      );
  }

  getFavorites(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/market/favorites`)
      .pipe(
        map((res: ApiResponse<any[]>) => res.data as any[]),
        catchError(err => this.optionalArray<any>(err))
      );
  }

  removeFavorite(symbol: string): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/market/favorites/${symbol}`)
      .pipe(
        map((res: ApiResponse<any>) => res.data),
        catchError(err => this.handleError(err))
      );
  }

  getNotifications(): Observable<NotificationItem[]> {
    return this.http.get<ApiResponse<LegacyAlert[]>>(`${environment.apiUrl}/api/v1/alerts`)
      .pipe(
        map((res: ApiResponse<LegacyAlert[]>) => (res.data || []).map(alert => this.mapAlertToNotification(alert))),
        catchError(err => this.optionalArray<NotificationItem>(err))
      );
  }

  getUnreadNotificationCount(): Observable<number> {
    return this.getNotifications().pipe(
      map(notifications => notifications.filter(notification => !notification.isRead).length)
    );
  }

  markNotificationAsRead(notificationId: number): Observable<void> {
    return of(void notificationId);
  }

  markAllNotificationsAsRead(): Observable<void> {
    return of(void 0);
  }

  private mapAlertToNotification(alert: LegacyAlert): NotificationItem {
    const symbol = alert.assetSymbol || 'Ativo';
    const condition = this.describeAlertCondition(alert);
    return {
      id: alert.id,
      userId: alert.userId,
      type: 'MARKET_PRICE',
      title: `Alerta de ${symbol}`,
      message: `${condition}. Preparado para virar aviso por WhatsApp quando a IA liberar uma oportunidade.`,
      isRead: false,
      createdAt: alert.createdAt || new Date().toISOString()
    };
  }

  private describeAlertCondition(alert: LegacyAlert): string {
    const value = Number(alert.targetValue || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

    switch (alert.conditionType) {
      case 'GREATER_THAN':
        return `Dispara quando passar de ${value}`;
      case 'LESS_THAN':
        return `Dispara quando cair abaixo de ${value}`;
      case 'EQUALS':
        return `Dispara quando chegar em ${value}`;
      case 'PERCENT_CHANGE':
        return `Dispara por variacao percentual configurada`;
      default:
        return 'Alerta de oportunidade configurado';
    }
  }

}
