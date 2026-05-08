import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/homepage/homepage.component').then(m => m.HomepageComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  
  { path: 'market', canActivate: [authGuard], loadComponent: () => import('./pages/assets/assets.component').then(m => m.AssetsComponent) },
  { path: 'market/detail/:symbol', canActivate: [authGuard], loadComponent: () => import('./pages/asset-detail/asset-detail.component').then(m => m.AssetDetailComponent) },
  { path: 'market/rankings', canActivate: [authGuard], loadComponent: () => import('./pages/rankings/rankings.component').then(m => m.RankingsComponent) },
  { path: 'market/compare', canActivate: [authGuard], loadComponent: () => import('./pages/compare/compare.component').then(m => m.CompareComponent) },
  { path: 'market/dividends', canActivate: [authGuard], loadComponent: () => import('./pages/dividends-calendar/dividends-calendar.component').then(m => m.DividendsCalendarComponent) },
  { path: 'market/screener', canActivate: [authGuard], loadComponent: () => import('./pages/screener/screener.component').then(m => m.ScreenerComponent) },
  { path: 'market/news', canActivate: [authGuard], loadComponent: () => import('./pages/news/news.component').then(m => m.NewsComponent) },
  
  { path: 'assets', redirectTo: 'market', pathMatch: 'full' },
  { path: 'wallet', canActivate: [authGuard], loadComponent: () => import('./pages/wallet/wallet.component').then(m => m.WalletComponent) },
  { path: 'favorites', canActivate: [authGuard], loadComponent: () => import('./pages/favorites/favorites.component').then(m => m.FavoritesComponent) },
  { path: 'calculators', canActivate: [authGuard], loadComponent: () => import('./pages/calculators/calculators.component').then(m => m.CalculatorsComponent) },
  
  { path: 'ai-analysis', canActivate: [authGuard], loadComponent: () => import('./pages/ai-analysis/ai-analysis.component').then(m => m.AiAnalysisComponent) },
  { path: 'subscription', canActivate: [authGuard], loadComponent: () => import('./pages/subscription/subscription.component').then(m => m.SubscriptionComponent) },
  { path: '**', redirectTo: 'dashboard' }
];
