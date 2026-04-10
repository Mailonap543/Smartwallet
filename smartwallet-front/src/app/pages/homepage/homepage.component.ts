import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Asset } from '../../services/api.service';
import { LoadingComponent } from '../../shared/components/loading.component';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent],
  template: `
    <div class="homepage">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <h1 class="hero-title">SmartWallet</h1>
          <p class="hero-subtitle">Sua plataforma de investimentos completa</p>
          <div class="hero-actions">
            <a routerLink="/register" class="btn btn-primary">Começar Agora</a>
            <a routerLink="/market" class="btn btn-outline">Explorar Mercado</a>
          </div>
        </div>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-value">10k+</span>
            <span class="stat-label">Ativos</span>
          </div>
          <div class="stat">
            <span class="stat-value">50k+</span>
            <span class="stat-label">Investidores</span>
          </div>
          <div class="stat">
            <span class="stat-value">R$ 1B+</span>
            <span class="stat-label"> Volume</span>
          </div>
        </div>
      </section>

      <!-- Quick Access -->
      <section class="quick-access">
        <h2 class="section-title">O que você precisa</h2>
        <div class="cards-grid">
          <a routerLink="/market" class="quick-card">
            <span class="card-icon">📊</span>
            <span class="card-title">Buscar Ativos</span>
            <span class="card-desc">Encontre ações, FIIs, BDRs e mais</span>
          </a>
          <a routerLink="/market/rankings" class="quick-card">
            <span class="card-icon">🏆</span>
            <span class="card-title">Rankings</span>
            <span class="card-desc">Os melhores investimentos por categoria</span>
          </a>
          <a routerLink="/market/compare" class="quick-card">
            <span class="card-icon">⚖️</span>
            <span class="card-title">Comparar</span>
            <span class="card-desc">Compare ativos lado a lado</span>
          </a>
          <a routerLink="/calculators" class="quick-card">
            <span class="card-icon">🧮</span>
            <span class="card-title">Calculadoras</span>
            <span class="card-desc">Simule investimentos e metas</span>
          </a>
        </div>
      </section>

      <!-- Featured Assets -->
      <section class="featured">
        <div class="section-header">
          <h2 class="section-title">Destaques do Mercado</h2>
          <a routerLink="/market" class="view-all">Ver todos →</a>
        </div>

        @if (loading()) {
          <app-loading message="Carregando..." />
        } @else {
          <div class="assets-grid">
            @for (asset of featured(); track asset.symbol) {
              <a [routerLink]="['/market/detail', asset.symbol]" class="asset-card">
                <div class="asset-symbol">{{ asset.symbol }}</div>
                <div class="asset-name">{{ asset.name }}</div>
                <div class="asset-price">{{ asset.currentPrice | currency:'BRL' }}</div>
                <div class="asset-change" [class.positive]="(asset.changePercent ?? 0) >= 0" [class.negative]="(asset.changePercent ?? 0) < 0">
                  {{ (asset.changePercent ?? 0) >= 0 ? '+' : '' }}{{ asset.changePercent ?? 0 | number:'1.2-2' }}%
                </div>
              </a>
            }
          </div>
        }
      </section>

      <!-- Trending -->
      <section class="trending">
        <h2 class="section-title">Mais Buscados</h2>
        <div class="trending-list">
          @for (asset of trending(); track asset.symbol) {
            <a [routerLink]="['/market/detail', asset.symbol]" class="trending-item">
              <span class="trending-symbol">{{ asset.symbol }}</span>
              <span class="trending-name">{{ asset.name }}</span>
              <span class="trending-price">{{ asset.currentPrice | currency:'BRL' }}</span>
            </a>
          }
        </div>
      </section>

      <!-- Categories -->
      <section class="categories">
        <h2 class="section-title">Explore por Categoria</h2>
        <div class="category-chips">
          @for (cat of categories(); track cat.code) {
            <a [routerLink]="['/market']" [queryParams]="{category: cat.code}" class="category-chip">
              {{ cat.name }}
            </a>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .homepage {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--space-lg);
    }
    .hero {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-2xl) 0;
      border-bottom: 1px solid var(--border);
    }
    .hero-title {
      font-size: 48px;
      font-weight: bold;
      margin: 0 0 var(--space-sm);
    }
    .hero-subtitle {
      font-size: var(--font-xl);
      color: var(--text-secondary);
      margin: 0 0 var(--space-lg);
    }
    .hero-actions {
      display: flex;
      gap: var(--space-md);
    }
    .btn {
      padding: var(--space-md) var(--space-lg);
      border-radius: var(--radius-md);
      font-weight: 500;
      text-decoration: none;
      display: inline-block;
    }
    .btn-primary {
      background: var(--primary);
      color: white;
    }
    .btn-primary:hover {
      background: var(--primary-dark);
    }
    .btn-outline {
      border: 1px solid var(--border);
      color: var(--text-primary);
    }
    .btn-outline:hover {
      background: var(--card);
    }
    .hero-stats {
      display: flex;
      gap: var(--space-xl);
    }
    .stat {
      text-align: center;
    }
    .stat-value {
      display: block;
      font-size: var(--font-2xl);
      font-weight: bold;
    }
    .stat-label {
      color: var(--text-secondary);
      font-size: var(--font-sm);
    }
    .section-title {
      font-size: var(--font-xl);
      font-weight: 600;
      margin: 0 0 var(--space-lg);
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-lg);
    }
    .view-all {
      color: var(--primary-light);
    }
    .quick-access {
      padding: var(--space-2xl) 0;
      border-bottom: 1px solid var(--border);
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-md);
    }
    .quick-card {
      display: block;
      padding: var(--space-lg);
      background: var(--card);
      border-radius: var(--radius-lg);
      text-decoration: none;
      border: 1px solid var(--border);
      transition: transform 0.2s;
    }
    .quick-card:hover {
      transform: translateY(-2px);
    }
    .card-icon {
      display: block;
      font-size: 32px;
      margin-bottom: var(--space-sm);
    }
    .card-title {
      display: block;
      font-weight: 600;
      color: var(--text-primary);
    }
    .card-desc {
      color: var(--text-secondary);
      font-size: var(--font-sm);
    }
    .featured {
      padding: var(--space-2xl) 0;
      border-bottom: 1px solid var(--border);
    }
    .assets-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: var(--space-md);
    }
    .asset-card {
      display: block;
      padding: var(--space-md);
      background: var(--card);
      border-radius: var(--radius-md);
      text-decoration: none;
      border: 1px solid var(--border);
      text-align: center;
    }
    .asset-symbol {
      font-weight: bold;
      color: var(--text-primary);
    }
    .asset-name {
      font-size: var(--font-sm);
      color: var(--text-secondary);
      margin-bottom: var(--space-xs);
    }
    .asset-price {
      font-size: var(--font-lg);
      font-weight: 600;
    }
    .asset-change {
      font-size: var(--font-sm);
    }
    .asset-change.positive { color: var(--success); }
    .asset-change.negative { color: var(--error); }
    .trending {
      padding: var(--space-2xl) 0;
      border-bottom: 1px solid var(--border);
    }
    .trending-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .trending-item {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md);
      background: var(--card);
      border-radius: var(--radius-md);
      text-decoration: none;
    }
    .trending-symbol {
      font-weight: bold;
      width: 60px;
    }
    .trending-name {
      flex: 1;
      color: var(--text-secondary);
    }
    .categories {
      padding: var(--space-2xl) 0;
    }
    .category-chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-sm);
    }
    .category-chip {
      padding: var(--space-sm) var(--space-md);
      background: var(--card);
      border-radius: var(--radius-full);
      color: var(--text-primary);
      text-decoration: none;
    }
    @media (max-width: 768px) {
      .hero {
        flex-direction: column;
        text-align: center;
      }
      .cards-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .assets-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class HomepageComponent implements OnInit {
  private api = inject(ApiService);

  loading = signal(true);
  featured = signal<Asset[]>([]);
  trending = signal<Asset[]>([]);
  categories = signal<{code: string; name: string}[]>([]);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getFeatured().subscribe({
      next: (data) => {
        this.featured.set(data);
        this.checkLoad();
      },
      error: () => this.checkLoad()
    });

    this.api.getTrending().subscribe({
      next: (data) => {
        this.trending.set(data);
        this.checkLoad();
      },
      error: () => this.checkLoad()
    });

    this.api.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.checkLoad();
      },
      error: () => this.checkLoad()
    });
  }

  checkLoad() {
    if (this.featured().length > 0 || this.trending().length > 0) {
      this.loading.set(false);
    }
  }
}
