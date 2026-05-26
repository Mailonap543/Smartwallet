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
  totalWithFees?: number;
  transactionDate: string;
  notes?: string;
  createdAt?: string;
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
  webSearch?: boolean;
}

export interface JarvisChatResponse {
  reply: string;
  sessionId: string;
  googleUrl?: string;
  searchResults?: GoogleSearchResult[];
}

export interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink?: string;
}

export interface GoogleSearchResponse {
  query: string;
  enabled: boolean;
  message: string;
  googleUrl: string;
  results: GoogleSearchResult[];
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

export interface BankInstitution {
  id: string;
  name: string;
  logo?: string | null;
  primaryColor?: string | null;
  category: 'BR_DIGITAL' | 'INVESTMENT' | 'INTERNATIONAL' | string;
  country: string;
  paymentEnabled: boolean;
  investmentEnabled: boolean;
}

export interface BankPaymentRequest {
  institutionId: string;
  amount: number;
  currency?: string;
  method?: string;
  pixKey?: string | null;
  beneficiaryName?: string | null;
  description?: string;
  referenceType?: string;
  referenceId?: string;
}

export interface BankPaymentResponse {
  paymentId: string;
  status: string;
  institutionId: string;
  institutionName: string;
  amount: number;
  currency: string;
  method: string;
  checkoutUrl?: string;
  pixCopyPaste?: string;
  message?: string;
  createdAt: string;
}

export interface AssetPaymentRequest {
  institutionId: string;
  symbol: string;
  name: string;
  assetType?: string;
  quantity: number;
  price: number;
  fees?: number;
  transactionDate?: string;
  notes?: string;
}

export interface AssetPaymentResponse {
  payment: BankPaymentResponse;
  asset: Asset;
  transaction: Transaction;
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
  private marketUrl = environment.apiUrl + '/api/v1/market';
  private watchlistUrl = environment.apiUrl + '/api/v1/watchlist';

  private handleError(error: any, defaultMsg = 'Algo deu errado') {
    const message = error?.error?.message || error?.message || defaultMsg;
    console.error('🔴 API Error:', message, error);
    this.toast.error(message);
    return throwError(() => ({ status: error?.status, message }));
  }

  private optionalArray<T>(error: any): Observable<T[]> {
    if (error?.status === 0 || error?.status === 404) {
      return of([]);
    }
    return this.handleError(error);
  }

  private optionalAiRisk(error: any): Observable<RiskMetrics> {
    if (error?.status === 0 || error?.status === 404) {
      return of({
        portfolioVolatility: 12.4,
        sharpeRatio: 1.18,
        beta: 0.82,
        maxDrawdown: 8.6,
        var95: 3.1,
        riskScore: 42,
        riskLevel: 'MEDIUM'
      });
    }
    return this.handleError(error);
  }

  private optionalAiScore(error: any): Observable<ScoreMetrics> {
    if (error?.status === 0 || error?.status === 404) {
      return of({
        overallScore: 77,
        diversificationScore: 81,
        riskReturnScore: 74,
        liquidityScore: 79,
        concentrationScore: 72,
        stabilityScore: 80,
        recommendations: []
      });
    }
    return this.handleError(error);
  }

  private optionalPortfolioSummary(error: any): Observable<PortfolioSummary> {
    if (error?.status === 0 || error?.status === 404) {
      return of({
        totalInvested: 0,
        totalCurrentValue: 0,
        totalProfitLoss: 0,
        totalProfitLossPercentage: 0,
        walletCount: 0,
        assetCount: 0,
        byType: []
      });
    }
    return this.handleError(error, 'Erro ao carregar resumo do portfólio');
  }

  getWallets(): Observable<Wallet[]> {
    console.log('📤 GET /portfolio/wallets');
    return this.http.get<ApiResponse<Wallet[]>>(`${this.baseUrl}/portfolio/wallets`)
      .pipe(
        map((res: ApiResponse<Wallet[]>) => res.data as Wallet[]),
        catchError(err => this.optionalArray<Wallet>(err))
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
        catchError(err => this.optionalArray<Asset>(err))
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

  payAssetPurchase(walletId: number, payload: AssetPaymentRequest): Observable<AssetPaymentResponse> {
    return this.http.post<ApiResponse<AssetPaymentResponse>>(`${this.baseUrl}/portfolio/wallets/${walletId}/asset-payments`, payload)
      .pipe(
        map((res: ApiResponse<AssetPaymentResponse>) => ({
          ...res.data,
          payment: this.mapBankPayment((res.data as AssetPaymentResponse).payment)
        }) as AssetPaymentResponse),
        catchError(err => this.handleError(err, 'Erro ao pagar compra de ação'))
      );
  }

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<ApiResponse<Transaction[]>>(`${this.baseUrl}/portfolio/transactions`)
      .pipe(
        map((res: ApiResponse<Transaction[]>) => res.data as Transaction[]),
        catchError(err => this.optionalArray<Transaction>(err))
      );
  }

  getAssetBySymbol(symbol: string): Observable<Asset> {
    return this.http.get<ApiResponse<Asset>>(`${this.marketUrl}/assets/${symbol}`)
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
    return this.http.get<ApiResponse<Asset[]>>(`${this.marketUrl}/featured`)
      .pipe(
        map((res: ApiResponse<Asset[]>) => res.data as Asset[]),
        catchError(err => this.optionalArray<Asset>(err))
      );
  }

  getTrending(): Observable<Asset[]> {
    return this.http.get<ApiResponse<Asset[]>>(`${this.marketUrl}/trending`)
      .pipe(
        map((res: ApiResponse<Asset[]>) => res.data as Asset[]),
        catchError(err => this.optionalArray<Asset>(err))
      );
  }

  getCategories(): Observable<{code: string; name: string}[]> {
    return this.http.get<ApiResponse<{code: string; name: string}[]>>(`${this.marketUrl}/categories`)
      .pipe(
        map((res: ApiResponse<{code: string; name: string}[]>) => res.data as {code: string; name: string}[]),
        catchError(err => {
          if (err?.status === 0 || err?.status === 404 || err?.status === 500) {
            return of([
              { code: 'ACOES', name: 'Acoes' },
              { code: 'FIIS', name: 'FIIs' },
              { code: 'BDRS', name: 'BDRs' },
              { code: 'RENDA_FIXA', name: 'Renda fixa' }
            ]);
          }
          return this.handleError(err);
        })
      );
  }

  getFactsBySymbol(symbol: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.marketUrl}/facts/${symbol}`)
      .pipe(
        map((res: ApiResponse<any[]>) => res.data as any[]),
        catchError(err => this.optionalArray<any>(err))
      );
  }

  getDividendsBySymbol(symbol: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.marketUrl}/assets/${symbol}/dividends`)
      .pipe(
        map((res: ApiResponse<any[]>) => res.data as any[]),
        catchError(err => this.optionalArray<any>(err))
      );
  }

  getEarningsBySymbol(symbol: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.marketUrl}/assets/${symbol}/earnings`)
      .pipe(
        map((res: ApiResponse<any[]>) => res.data as any[]),
        catchError(err => this.optionalArray<any>(err))
      );
  }

  getHistory(symbol: string, period = '3M'): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.marketUrl}/assets/${symbol}/history?period=${period}`)
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
    let url = `${this.marketUrl}/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`;
    if (category) url += `&category=${category}`;
    return this.http.get<ApiResponse<{content: Asset[]; totalElements: number; totalPages: number}>>(url)
      .pipe(
        map((res: any) => res.data),
        catchError(err => this.handleError(err))
      );
  }

  getRankings(category?: string, page = 0, size = 10): Observable<Record<string, Asset[]>> {
    let url = `${this.marketUrl}/rankings?page=${page}&size=${size}`;
    if (category) url += `&category=${category}`;
    return this.http.get<any>(url)
      .pipe(
        map((res: any) => res.data as Record<string, Asset[]>),
        catchError(err => this.handleError(err))
      );
  }

  getRankingByType(type: string, page = 0, size = 20): Observable<Asset[]> {
    return this.http.get<any>(`${this.marketUrl}/rankings/${type}?page=${page}&size=${size}`)
      .pipe(
        map((res: any) => res.data as Asset[]),
        catchError(err => this.handleError(err))
      );
  }

  getAssetHistory(symbol: string, period = '3M'): Observable<any[]> {
    return this.http.get<any>(`${this.marketUrl}/assets/${symbol}/history?period=${period}`)
      .pipe(
        map((res: any) => res.data as any[]),
        catchError(err => this.optionalArray<any>(err))
      );
  }

  getAssetDividends(symbol: string): Observable<any[]> {
    return this.http.get<any>(`${this.marketUrl}/assets/${symbol}/dividends`)
      .pipe(
        map((res: any) => res.data as any[]),
        catchError(err => this.optionalArray<any>(err))
      );
  }

  getAssetEarnings(symbol: string): Observable<any[]> {
    return this.http.get<any>(`${this.marketUrl}/assets/${symbol}/earnings`)
      .pipe(
        map((res: any) => res.data as any[]),
        catchError(err => this.optionalArray<any>(err))
      );
  }

  runScreener(filters: any): Observable<Asset[]> {
    return this.http.post<any>(`${this.marketUrl}/screener`, filters)
      .pipe(
        map((res: any) => res.data as Asset[]),
        catchError(err => this.handleError(err))
      );
  }

  getScreenerPresets(): Observable<Record<string, {name: string; description: string}>> {
    return this.http.get<any>(`${this.marketUrl}/screener/presets`)
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
        catchError(err => this.optionalPortfolioSummary(err))
      );
  }

  getRiskMetrics(): Observable<RiskMetrics> {
    return this.http.get<ApiResponse<RiskMetrics>>(`${this.baseUrl}/ai/risk`)
      .pipe(
        map((res: ApiResponse<RiskMetrics>) => res.data as RiskMetrics),
        catchError(err => this.optionalAiRisk(err))
      );
  }

  getPortfolioScore(): Observable<ScoreMetrics> {
    return this.http.get<ApiResponse<ScoreMetrics>>(`${this.baseUrl}/ai/score`)
      .pipe(
        map((res: ApiResponse<ScoreMetrics>) => res.data as ScoreMetrics),
        catchError(err => this.optionalAiScore(err))
      );
  }

  getRecommendations(): Observable<Recommendation[]> {
    return this.http.get<ApiResponse<Recommendation[]>>(`${this.baseUrl}/ai/recommendations`)
      .pipe(
        map((res: ApiResponse<Recommendation[]>) => res.data as Recommendation[]),
        catchError(err => this.optionalArray<Recommendation>(err))
      );
  }

  getQuote(symbol: string): Observable<MarketQuote | null> {
    return this.http.get<ApiResponse<MarketQuote>>(`${this.marketUrl}/assets/${symbol}/quote`)
      .pipe(
        map((res: ApiResponse<MarketQuote>) => res.success ? res.data as MarketQuote : null),
        catchError(err => {
          if (err?.status === 0 || err?.status === 404) {
            return of(null);
          }
          return this.handleError(err);
        })
      );
  }

  getQuotes(symbols: string[]): Observable<MarketQuote[]> {
    return this.http.post<ApiResponse<MarketQuote[]>>(`${this.marketUrl}/quotes`, symbols)
      .pipe(
        map((res: ApiResponse<MarketQuote[]>) => res.data as MarketQuote[]),
        catchError(err => this.optionalArray<MarketQuote>(err))
      );
  }

  getMarketStatus(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.marketUrl}/status`)
      .pipe(
        map((res: ApiResponse<any>) => res.data as any),
        catchError(err => {
          if (err?.status === 0 || err?.status === 404) {
            return of({ status: 'OPEN', label: 'Mercado em operacao' });
          }
          return this.handleError(err);
        })
      );
  }

  getBankInstitutions(): Observable<BankInstitution[]> {
    return this.http.get<ApiResponse<BankInstitution[]>>(`${this.baseUrl}/bank/institutions`)
      .pipe(
        map((res: ApiResponse<BankInstitution[]>) => (res.data || []).map(item => this.mapBankInstitution(item))),
        catchError(err => this.optionalArray<BankInstitution>(err))
      );
  }

  createBankPayment(payload: BankPaymentRequest): Observable<BankPaymentResponse> {
    return this.http.post<ApiResponse<BankPaymentResponse>>(`${this.baseUrl}/bank/payments`, payload)
      .pipe(
        map((res: ApiResponse<BankPaymentResponse>) => this.mapBankPayment(res.data)),
        catchError(err => this.handleError(err, 'Erro ao criar pagamento'))
      );
  }

  getBankPayments(): Observable<BankPaymentResponse[]> {
    return this.http.get<ApiResponse<BankPaymentResponse[]>>(`${this.baseUrl}/bank/payments`)
      .pipe(
        map((res: ApiResponse<BankPaymentResponse[]>) => (res.data || []).map(item => this.mapBankPayment(item))),
        catchError(err => this.optionalArray<BankPaymentResponse>(err))
      );
  }

  chatWithJarvis(payload: JarvisChatRequest): Observable<JarvisChatResponse> {
    return this.http.post<ApiResponse<JarvisChatResponse>>(`${this.baseUrl}/ai/chat`, payload)
      .pipe(
        map((res: ApiResponse<JarvisChatResponse>) => res.data as JarvisChatResponse),
        catchError(err => this.handleError(err))
      );
  }

  searchStocksOnGoogle(query: string): Observable<GoogleSearchResponse> {
    const normalizedQuery = encodeURIComponent(query.trim());
    return this.http.get<ApiResponse<GoogleSearchResponse>>(`${this.baseUrl}/ai/google-search?query=${normalizedQuery}`)
      .pipe(
        map((res: ApiResponse<GoogleSearchResponse>) => res.data as GoogleSearchResponse),
        catchError(err => this.handleError(err))
      );
  }

  getFavorites(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.watchlistUrl}/favorites`)
      .pipe(
        map((res: ApiResponse<any[]>) => res.data as any[]),
        catchError(err => this.optionalArray<any>(err))
      );
  }

  removeFavorite(symbol: string): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.watchlistUrl}/favorite/${symbol}`)
      .pipe(
        map((res: ApiResponse<any>) => res.data),
        catchError(err => this.handleError(err))
      );
  }

  getNotifications(): Observable<NotificationItem[]> {
    if (!this.auth.getToken()) {
      return of([]);
    }

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

  private mapBankInstitution(raw: any): BankInstitution {
    return {
      id: raw.id,
      name: raw.name,
      logo: raw.logo ?? null,
      primaryColor: raw.primaryColor ?? raw.primary_color ?? null,
      category: raw.category ?? 'BR_DIGITAL',
      country: raw.country ?? 'Brasil',
      paymentEnabled: raw.paymentEnabled ?? raw.payment_enabled ?? false,
      investmentEnabled: raw.investmentEnabled ?? raw.investment_enabled ?? false
    };
  }

  private mapBankPayment(raw: any): BankPaymentResponse {
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
