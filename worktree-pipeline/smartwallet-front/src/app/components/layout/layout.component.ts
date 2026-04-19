import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SearchBarComponent } from '../search-bar/search-bar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, SearchBarComponent],
  template: `
    <div class="layout">
      <!-- Header -->
      <header class="header">
        <div class="header-left">
          <a routerLink="/home" class="logo">SmartWallet</a>
          <app-search-bar class="header-search" />
        </div>
        <div class="header-right">
          <nav class="header-nav">
            <a routerLink="/market" routerLinkActive="active">Mercado</a>
            <a routerLink="/wallet" routerLinkActive="active">Carteira</a>
            <a routerLink="/favorites" routerLinkActive="active">Favoritos</a>
          </nav>
          <div class="user-menu">
            <button class="user-btn" (click)="toggleMenu()">
              {{ user()?.fullName?.charAt(0) || 'U' }}
            </button>
            @if (menuOpen()) {
              <div class="dropdown">
                <a routerLink="/dashboard">Dashboard</a>
                <a routerLink="/ai-analysis">Análise IA</a>
                <a routerLink="/subscription">Plano</a>
                <button (click)="logout()">Sair</button>
              </div>
            }
          </div>
        </div>
      </header>

      <!-- Sidebar -->
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span>
            <span class="nav-label">Dashboard</span>
          </a>
          <a routerLink="/market" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📈</span>
            <span class="nav-label">Mercado</span>
          </a>
          <a routerLink="/market/rankings" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🏆</span>
            <span class="nav-label">Rankings</span>
          </a>
          <a routerLink="/market/compare" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">⚖️</span>
            <span class="nav-label">Comparar</span>
          </a>
          <a routerLink="/market/screener" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🔍</span>
            <span class="nav-label">Screener</span>
          </a>
          <a routerLink="/market/dividends" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📅</span>
            <span class="nav-label">Dividendos</span>
          </a>

          <div class="nav-divider"></div>

          <a routerLink="/wallet" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">💼</span>
            <span class="nav-label">Carteira</span>
          </a>
          <a routerLink="/favorites" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">⭐</span>
            <span class="nav-label">Favoritos</span>
          </a>

          <div class="nav-divider"></div>

          <a routerLink="/ai-analysis" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🤖</span>
            <span class="nav-label">IA Análise</span>
          </a>
          <a routerLink="/calculators" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🧮</span>
            <span class="nav-label">Calculadoras</span>
          </a>
          <a routerLink="/news" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📰</span>
            <span class="nav-label">Notícias</span>
          </a>

          <div class="nav-spacer"></div>

          <a routerLink="/subscription" routerLinkActive="active" class="nav-item premium">
            <span class="nav-icon">⭐</span>
            <span class="nav-label">Premium</span>
          </a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="main">
        <ng-content></ng-content>
      </main>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 var(--space-lg);
      height: 60px;
      background: var(--card);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: var(--space-xl);
    }
    .header-search {
      width: 350px;
    }
    .logo {
      font-size: var(--font-xl);
      font-weight: bold;
      color: var(--primary);
      text-decoration: none;
    }
    .header-nav {
      display: flex;
      gap: var(--space-lg);
    }
    .header-nav a {
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }
    .header-nav a:hover,
    .header-nav a.active {
      color: var(--text-primary);
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: var(--space-lg);
    }
    .user-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      font-weight: bold;
      border: none;
      cursor: pointer;
    }
    .user-menu {
      position: relative;
    }
    .dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: var(--space-sm);
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      min-width: 150px;
      padding: var(--space-xs);
      z-index: 100;
    }
    .dropdown a,
    .dropdown button {
      display: block;
      width: 100%;
      padding: var(--space-sm) var(--space-md);
      text-align: left;
      background: none;
      border: none;
      color: var(--text-primary);
      text-decoration: none;
      cursor: pointer;
      border-radius: var(--radius-sm);
    }
    .dropdown a:hover,
    .dropdown button:hover {
      background: var(--bg);
    }

    .sidebar {
      position: fixed;
      left: 0;
      top: 60px;
      bottom: 0;
      width: 220px;
      background: var(--card);
      border-right: 1px solid var(--border);
      overflow-y: auto;
      z-index: 40;
    }
    .sidebar-nav {
      padding: var(--space-md);
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      text-decoration: none;
      margin-bottom: var(--space-xs);
      transition: all 0.2s;
    }
    .nav-item:hover {
      background: var(--bg);
      color: var(--text-primary);
    }
    .nav-item.active {
      background: var(--primary);
      color: white;
    }
    .nav-icon {
      font-size: 18px;
    }
    .nav-label {
      font-weight: 500;
    }
    .nav-divider {
      height: 1px;
      background: var(--border);
      margin: var(--space-md) 0;
    }
    .nav-spacer {
      flex: 1;
    }
    .nav-item.premium {
      background: linear-gradient(135deg, #F59E0B, #EF4444);
      color: white;
    }

    .main {
      margin-left: 220px;
      margin-top: 60px;
      flex: 1;
      background: var(--bg);
    }

    @media (max-width: 1024px) {
      .header-search {
        width: 250px;
      }
      .header-nav {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .sidebar {
        display: none;
      }
      .main {
        margin-left: 0;
      }
    }
  `]
})
export class LayoutComponent {
  auth = inject(AuthService);
  user = this.auth.user;
  menuOpen = signal(false);

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  logout() {
    this.auth.logout();
  }
}