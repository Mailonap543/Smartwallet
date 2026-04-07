import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/homepage/homepage.component').then(m => m.HomepageComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  
  { path: 'market', loadComponent: () => import('./pages/assets/assets.component').then(m => m.AssetsComponent) },
  { path: 'market/detail/:symbol', loadComponent: () => import('./pages/asset-detail/asset-detail.component').then(m => m.AssetDetailComponent) },
  { path: 'market/rankings', loadComponent: () => import('./pages/rankings/rankings.component').then(m => m.RankingsComponent) },
  { path: 'market/compare', loadComponent: () => import('./pages/compare/compare.component').then(m => m.CompareComponent) },
  { path: 'market/dividends', loadComponent: () => import('./pages/dividends-calendar/dividends-calendar.component').then(m => m.DividendsCalendarComponent) },
  { path: 'market/screener', loadComponent: () => import('./pages/screener/screener.component').then(m => m.ScreenerComponent) },
  { path: 'market/news', loadComponent: () => import('./pages/news/news.component').then(m => m.NewsComponent) },
  
  { path: 'assets', redirectTo: 'market', pathMatch: 'full' },
  { path: 'wallet', loadComponent: () => import('./pages/wallet/wallet.component').then(m => m.WalletComponent) },
  { path: 'favorites', loadComponent: () => import('./pages/favorites/favorites.component').then(m => m.FavoritesComponent) },
  { path: 'calculators', loadComponent: () => import('./pages/calculators/calculators.component').then(m => m.CalculatorsComponent) },
  
  { path: 'ai-analysis', loadComponent: () => import('./pages/ai-analysis/ai-analysis.component').then(m => m.AiAnalysisComponent) },
  { path: 'subscription', loadComponent: () => import('./pages/subscription/subscription.component').then(m => m.SubscriptionComponent) },
  { path: '**', redirectTo: 'dashboard' }
];