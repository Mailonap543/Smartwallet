import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'assets', loadComponent: () => import('./pages/assets/assets.component').then(m => m.AssetsComponent) },
  { path: 'ai', loadComponent: () => import('./pages/ai-analysis/ai-analysis.component').then(m => m.AiAnalysisComponent) },
  { path: '**', redirectTo: 'login' }
];