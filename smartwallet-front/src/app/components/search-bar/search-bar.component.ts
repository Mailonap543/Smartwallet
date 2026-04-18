import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, Asset } from '../../services/api.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="search-container" [class.focused]="isFocused()">
      <div class="search-input-wrapper">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          [(ngModel)]="query"
          (input)="onSearch()"
          (focus)="onFocus()"
          (blur)="onBlur()"
          placeholder="Buscar ativos, ações, FIIs..."
          aria-label="Buscar ativos"
          class="search-input"
          autocomplete="off"
        />
        @if (query) {
          <button (click)="clear()" class="clear-btn">×</button>
        }
      </div>
      
      @if (showResults() && results().length > 0) {
        <div class="search-results">
          @for (asset of results(); track asset.symbol) {
            <a [routerLink]="['/market/detail', asset.symbol]" class="search-result" (mousedown)="selectAsset()">
              <div class="result-symbol">{{ asset.symbol }}</div>
              <div class="result-name">{{ asset.name }}</div>
              <div class="result-price">{{ asset.currentPrice | currency:'BRL' }}</div>
            </a>
          }
          @if (hasMore()) {
            <a [routerLink]="['/market']" [queryParams]="{q: query}" class="search-more" (mousedown)="selectAsset()">
              Ver todos os resultados →
            </a>
          }
        </div>
      }

      @if (showResults() && results().length === 0 && query.length >= 2 && !loading()) {
        <div class="search-results">
          <div class="no-results">Nenhum resultado encontrado</div>
        </div>
      }
    </div>
  `,
  styles: [`
    .search-container {
      position: relative;
      width: 100%;
      max-width: 400px;
    }
    .search-input-wrapper {
      display: flex;
      align-items: center;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 0 var(--space-md);
    }
    .search-container.focused .search-input-wrapper {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }
    .search-icon {
      width: 20px;
      height: 20px;
      color: var(--text-muted);
    }
    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      padding: var(--space-sm) var(--space-md);
      color: var(--text-primary);
      font-size: var(--font-md);
      outline: none;
    }
    .search-input::placeholder {
      color: var(--text-muted);
    }
    .clear-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 20px;
      cursor: pointer;
      padding: 0 var(--space-xs);
    }
    .search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      margin-top: var(--space-xs);
      max-height: 400px;
      overflow-y: auto;
      z-index: 100;
    }
    .search-result {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md);
      text-decoration: none;
      border-bottom: 1px solid var(--border);
      cursor: pointer;
    }
    .search-result:hover {
      background: var(--bg);
    }
    .result-symbol {
      font-weight: bold;
      width: 60px;
      color: var(--text-primary);
    }
    .result-name {
      flex: 1;
      color: var(--text-secondary);
      font-size: var(--font-sm);
    }
    .result-price {
      color: var(--text-primary);
    }
    .search-more {
      display: block;
      padding: var(--space-md);
      text-align: center;
      color: var(--primary-light);
      text-decoration: none;
    }
    .no-results {
      padding: var(--space-lg);
      text-align: center;
      color: var(--text-muted);
    }
  `]
})
export class SearchBarComponent {
  private api = inject(ApiService);

  query = '';
  results = signal<Asset[]>([]);
  isFocused = signal(false);
  showResults = signal(false);
  loading = signal(false);
  hasMore = signal(false);

  onSearch() {
    if (this.query.length < 2) {
      this.results.set([]);
      this.showResults.set(false);
      return;
    }

    this.loading.set(true);
    this.api.searchMarket(this.query).subscribe({
      next: (data) => {
        this.results.set(data.content.slice(0, 5));
        this.hasMore.set(data.totalElements > 5);
        this.showResults.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onFocus() {
    this.isFocused.set(true);
    if (this.query.length >= 2 && this.results().length > 0) {
      this.showResults.set(true);
    }
  }

  onBlur() {
    setTimeout(() => {
      this.isFocused.set(false);
      this.showResults.set(false);
    }, 200);
  }

  clear() {
    this.query = '';
    this.results.set([]);
    this.showResults.set(false);
  }

  selectAsset() {
    setTimeout(() => {
      this.clear();
    }, 100);
  }
}
