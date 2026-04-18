import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Asset } from '../../services/api.service';
import { LoadingComponent } from '../../shared/components/loading.component';
import { CardComponent } from '../../shared/components/card-input.component';

interface RankingItem {
  rank: number;
  asset: Asset;
}

@Component({
  selector: 'app-rankings',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent, CardComponent],
  template: `
    <div class="rankings-page">
      <h1>Rankings</h1>

      
      <div class="filters">
        <button [class.active]="activeFilter === 'dividend'" (click)="setFilter('dividend')">Maiores Dividendos</button>
        <button [class.active]="activeFilter === 'roe'" (click)="setFilter('roe')">Maior ROE</button>
        <button [class.active]="activeFilter === 'pe'" (click)="setFilter('pe')">Menor P/L</button>
        <button [class.active]="activeFilter === 'pb'" (click)="setFilter('pb')">Menor P/VP</button>
        <button [class.active]="activeFilter === 'volume'" (click)="setFilter('volume')">Maior Liquidez</button>
      </div>

      @if (loading) {
        <app-loading message="Carregando rankings..." />
      } @else {
        <div class="ranking-list">
          @for (item of rankingItems; track item.rank) {
            <app-card [hoverable]="true" class="ranking-item" [routerLink]="['/market/detail', item.asset.symbol]">
              <span class="rank" [class.top3]="item.rank <= 3">{{ item.rank }}</span>
              <div class="asset-info">
                <span class="symbol">{{ item.asset.symbol }}</span>
                <span class="name">{{ item.asset.name }}</span>
              </div>
              <div class="metric">
                <span class="value">{{ getMetricValue(item.asset) | number:'1.2-2' }}</span>
                <span class="label">{{ metricLabel }}</span>
              </div>
            </app-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .rankings-page { padding: var(--space-lg); max-width: 900px; margin: 0 auto; }
    h1 { margin-bottom: var(--space-lg); }
    .filters { display: flex; gap: var(--space-sm); flex-wrap: wrap; margin-bottom: var(--space-lg); }
    .filters button {
      padding: var(--space-sm) var(--space-md);
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .filters button.active { background: var(--primary); border-color: var(--primary); }
    .ranking-list { display: flex; flex-direction: column; gap: var(--space-sm); }
    .ranking-item { display: flex; align-items: center; gap: var(--space-md); }
    .rank { font-size: var(--font-lg); font-weight: bold; width: 40px; color: var(--text-secondary); }
    .rank.top3 { color: var(--warning); }
    .asset-info { flex: 1; display: flex; flex-direction: column; }
    .symbol { font-weight: 600; }
    .name { font-size: var(--font-sm); color: var(--text-secondary); }
    .metric { text-align: right; }
    .metric .value { font-size: var(--font-lg); font-weight: 600; display: block; }
    .metric .label { font-size: var(--font-xs); color: var(--text-muted); }
  `]
})
export class RankingsComponent implements OnInit {
  private api = inject(ApiService);
  activeFilter = 'dividend';
  rankingItems: RankingItem[] = [];
  loading = true;

  get metricLabel(): string {
    const labels: Record<string, string> = {
      dividend: 'Dividend Yield %',
      roe: 'ROE %',
      pe: 'P/L',
      pb: 'P/VP',
      volume: 'Volume'
    };
    return labels[this.activeFilter] || '';
  }

  getMetricValue(asset: Asset): number {
    switch (this.activeFilter) {
      case 'dividend': return asset.dividendYield || 0;
      case 'roe': return asset.roe || 0;
      case 'pe': return asset.priceToEarnings || 0;
      case 'pb': return asset.priceToBook || 0;
      case 'volume': return asset.dayVolume || 0;
      default: return 0;
    }
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.loadRankings();
  }

  ngOnInit() {
    this.loadRankings();
  }

  loadRankings() {
    this.loading = true;

    
    const apiMap: Record<string, string> = {
      dividend: 'dividendyield',
      roe: 'roe',
      pe: 'price-to-earnings',
      pb: 'price-to-book',
      volume: 'liquidez'
    };

    const apiType = apiMap[this.activeFilter] || 'dividendyield';
    
    this.api.getRankingByType(apiType).subscribe({
      next: (assets) => {
        this.rankingItems = assets.map((asset, i) => ({
          rank: i + 1,
          asset: asset
        }));
        this.loading = false;
      },
      error: () => {
        this.rankingItems = [];
        this.loading = false;
      }
    });
  }
}
