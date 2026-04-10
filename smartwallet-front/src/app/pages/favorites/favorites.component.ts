import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../shared/components/card-input.component';
import { ApiService, Asset } from '../../services/api.service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../shared/card-input.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent],
  template: `
    <div class="favorites-page">
      <h1>Favoritos</h1>

      
      @if (favorites.length) {
        <div class="favorites-list">
          @for (fav of favorites; track fav.symbol) {
            <app-card [hoverable]="true" [routerLink]="['/market/detail', fav.symbol]">
              <span class="star" (click)="removeFavorite(fav, $event)">★</span>
              <div class="info">
                <span class="symbol">{{ fav.symbol }}</span>
                <span class="name">{{ fav.name }}</span>
              </div>
              <div class="price">
                <span class="value">{{ fav.currentPrice | number:'1.2-2' }}</span>
                <span class="change" [class.positive]="(fav.changePercent ?? 0) >= 0" [class.negative]="(fav.changePercent ?? 0) < 0">
                  {{ (fav.changePercent ?? 0) >= 0 ? '+' : '' }}{{ fav.changePercent ?? 0 | number:'1.2-2' }}%
                <span class="change" [class.positive]="fav.changePercent >= 0" [class.negative]="fav.changePercent < 0">
                  {{ fav.changePercent >= 0 ? '+' : '' }}{{ fav.changePercent | number:'1.2-2' }}%
                </span>
              </div>
            </app-card>
          }
        </div>
      } @else {
        <div class="empty">
          <p>Você ainda não tem favoritos</p>
          <a routerLink="/market">Explorar ativos</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .favorites-page { padding: var(--space-lg); max-width: 900px; margin: 0 auto; }
    h1 { margin-bottom: var(--space-lg); }
    .favorites-list { display: flex; flex-direction: column; gap: var(--space-sm); }
    .favorites-list app-card { display: flex; align-items: center; gap: var(--space-md); }
    .star { font-size: var(--font-xl); color: var(--warning); cursor: pointer; }
    .info { flex: 1; }
    .info .symbol { font-weight: 600; display: block; }
    .info .name { font-size: var(--font-sm); color: var(--text-secondary); }
    .price { text-align: right; }
    .price .value { font-size: var(--font-lg); font-weight: 600; display: block; }
    .price .change { font-size: var(--font-sm); }
    .positive { color: var(--success); }
    .negative { color: var(--error); }
    .empty { text-align: center; padding: var(--space-2xl); color: var(--text-secondary); }
    .empty a { color: var(--primary-light); }
  `]
})
export class FavoritesComponent {
  private api = inject(ApiService);
  favorites: Asset[] = [];

  ngOnInit() {
    this.api.getFavorites().subscribe({
      next: data => this.favorites = data
    });
  }

  removeFavorite(fav: any, event: Event) {
    event.stopPropagation();
    this.api.removeFavorite(fav.symbol).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(f => f.symbol !== fav.symbol);
      }
    });
  }
}
  favorites = [
    { symbol: 'PETR4', name: 'Petrobras', currentPrice: 38.50, changePercent: 2.5 },
    { symbol: 'VALE3', name: 'Vale', currentPrice: 68.90, changePercent: -1.2 },
    { symbol: 'ITUB4', name: 'Itaú', currentPrice: 35.20, changePercent: 0.8 },
  ];

  removeFavorite(fav: any, event: Event) {
    event.stopPropagation();
    this.favorites = this.favorites.filter(f => f.symbol !== fav.symbol);
  }
}
