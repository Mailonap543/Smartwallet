import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Asset } from '../../services/api.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="compare-page">
      <h1>Comparar Ativos</h1>

      <div class="add-asset">
        <input #searchInput type="text" placeholder="Buscar ativo..." (input)="onSearch(searchInput.value)" />
        @if (searchResults().length) {
          <div class="search-results">
            @for (result of searchResults(); track result.symbol) {
              <button (click)="addToCompare(result)">{{ result.symbol }} - {{ result.name }}</button>
            }
          </div>
        }
      </div>

      @if (compareAssets().length) {
        <div class="compare-table">
          <table>
            <thead>
              <tr>
                <th>Indicador</th>
                @for (asset of compareAssets(); track asset.symbol) {
                  <th>
                    <a [routerLink]="['/market/detail', asset.symbol]" class="asset-link">{{ asset.symbol }}</a>
                    <button (click)="removeFromCompare(asset)" class="remove">✕</button>
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Preço</td>
                @for (asset of compareAssets(); track asset.symbol) {
                  <td>{{ asset.currentPrice | currency:'BRL' }}</td>
                }
              </tr>
              <tr>
                <td>Variação</td>
                @for (asset of compareAssets(); track asset.symbol) {
                  <td [class.positive]="(asset.changePercent ?? 0) >= 0" [class.negative]="(asset.changePercent ?? 0) < 0">
                    {{ (asset.changePercent ?? 0) >= 0 ? '+' : '' }}{{ asset.changePercent ?? 0 | number:'1.2-2' }}%
                  </td>
                }
              </tr>
              <tr>
                <td>P/L</td>
                @for (asset of compareAssets(); track asset.symbol) {
                  <td>{{ asset.priceToEarnings ?? '-' }}</td>
                }
              </tr>
              <tr>
                <td>P/VP</td>
                @for (asset of compareAssets(); track asset.symbol) {
                  <td>{{ asset.priceToBook ?? '-' }}</td>
                }
              </tr>
              <tr>
                <td>Dividend Yield</td>
                @for (asset of compareAssets(); track asset.symbol) {
                  <td>{{ asset.dividendYield ? (asset.dividendYield | number:'1.2-2') + '%' : '-' }}</td>
                }
              </tr>
              <tr>
                <td>ROE</td>
                @for (asset of compareAssets(); track asset.symbol) {
                  <td>{{ asset.roe ? (asset.roe | number:'1.2-2') + '%' : '-' }}</td>
                }
              </tr>
              <tr>
                <td>Market Cap</td>
                @for (asset of compareAssets(); track asset.symbol) {
                  <td>{{ asset.marketCap ? (asset.marketCap | number:'1.0-0':'pt-BR') : '-' }}</td>
                }
              </tr>
            </tbody>
          </table>
        </div>
      } @else {
        <div class="empty">
          <p>Adicione ativos para comparar (máximo 5)</p>
          <div class="quick-add">
            <p class="hint">Clique rápido:</p>
            <div class="chips">
              <button (click)="addQuick('PETR4')">PETR4</button>
              <button (click)="addQuick('VALE3')">VALE3</button>
              <button (click)="addQuick('ITUB4')">ITUB4</button>
              <button (click)="addQuick('BBDC4')">BBDC4</button>
              <button (click)="addQuick('ABEV3')">ABEV3</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .compare-page { padding: var(--space-lg); max-width: 1200px; margin: 0 auto; }
    h1 { margin-bottom: var(--space-lg); }
    .add-asset { margin-bottom: var(--space-lg); position: relative; }
    .add-asset input { width: 100%; padding: var(--space-md); background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); font-size: var(--font-md); }
    .search-results { position: absolute; top: 100%; left: 0; right: 0; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-md); max-height: 200px; overflow-y: auto; z-index: 10; }
    .search-results button { width: 100%; padding: var(--space-md); text-align: left; background: none; border: none; color: var(--text-primary); cursor: pointer; }
    .search-results button:hover { background: var(--bg); }
    .compare-table { overflow-x: auto; background: var(--card); border-radius: var(--radius-lg); }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: var(--space-md); text-align: center; border-bottom: 1px solid var(--border); }
    th:first-child, td:first-child { text-align: left; font-weight: 600; }
    th { background: var(--card); position: relative; }
    .asset-link { color: var(--primary-light); text-decoration: none; }
    .remove { position: absolute; top: var(--space-xs); right: var(--space-xs); background: none; border: none; color: var(--error); cursor: pointer; font-size: var(--font-sm); }
    .positive { color: var(--success); }
    .negative { color: var(--error); }
    .empty { text-align: center; padding: var(--space-2xl); color: var(--text-secondary); }
    .quick-add { margin-top: var(--space-lg); }
    .hint { font-size: var(--font-sm); margin-bottom: var(--space-sm); }
    .chips { display: flex; gap: var(--space-sm); justify-content: center; flex-wrap: wrap; }
    .chips button { padding: var(--space-sm) var(--space-md); background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-full); color: var(--text-primary); cursor: pointer; }
    .chips button:hover { background: var(--primary); border-color: var(--primary); }
  `]
})
export class CompareComponent {
  private api = inject(ApiService);
  compareAssets = signal<Asset[]>([]);
  searchResults = signal<Asset[]>([]);

  onSearch(query: string) {
    if (query.length >= 2) {
      this.api.searchMarket(query).subscribe({
        next: (data) => this.searchResults.set(data.content.slice(0, 5)),
        error: () => this.searchResults.set([])
      });
    } else {
      this.searchResults.set([]);
    }
  }

  addToCompare(asset: Asset) {
    const current = this.compareAssets();
    if (current.length < 5 && !current.find(a => a.symbol === asset.symbol)) {
      this.compareAssets.set([...current, asset]);
    }
    this.searchResults.set([]);
  }

  addQuick(symbol: string) {
    this.api.getAssetBySymbol(symbol).subscribe({
      next: (asset) => this.addToCompare(asset),
      error: () => {}
    });
  }

  removeFromCompare(asset: Asset) {
    this.compareAssets.update(list => list.filter(a => a.symbol !== asset.symbol));
  }
}
