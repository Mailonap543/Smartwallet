import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Asset } from '../../services/api.service';

@Component({
  selector: 'app-screener',
  standalone: true,
  template: `
    <div class="screener-page">
      <h1>Screener</h1>
      <p class="subtitle">Encontre ativos baseados em critérios</p>


      <div class="builder">
        <h3>Filtros</h3>
        <div class="filters-grid">
          <div class="filter-item">
            <label>Tipo de Ativo</label>
            <select [(ngModel)]="filters.category">
              <option value="">Todos</option>
              <option value="STOCK">Ações</option>
              <option value="FII">FIIs</option>
              <option value="BDR">BDRs</option>
              <option value="ETF">ETFs</option>
            </select>
          </div>
          <div class="filter-item">
            <label>P/L Máx</label>
            <input type="number" [(ngModel)]="filters.maxPe" placeholder="Ex: 15" />
          </div>
          <div class="filter-item">
            <label>P/VP Máx</label>
            <input type="number" [(ngModel)]="filters.maxPb" placeholder="Ex: 2" />
          </div>
          <div class="filter-item">
            <label>Dividend Yield Mín (%)</label>
            <input type="number" [(ngModel)]="filters.minDy" placeholder="Ex: 5" />
          </div>
          <div class="filter-item">
            <label>ROE Mín (%)</label>
            <input type="number" [(ngModel)]="filters.minRoe" placeholder="Ex: 10" />
          </div>
          <div class="filter-item">
            <label>Setor</label>
            <select [(ngModel)]="filters.sector">
              <option value="">Todos</option>
              <option value="financeiro">Financeiro</option>
              <option value="energia">Energia</option>
              <option value="varejo">Varejo</option>
              <option value="tecnologia">Tecnologia</option>
              <option value="saude">Saúde</option>
            </select>
          </div>
        </div>
      </div>

      <div class="presets">
        <h3>Predefinições</h3>
        <div class="preset-buttons">
          <button (click)="applyPreset('dividends')" [class.active]="presetActive === 'dividends'">Dividendos</button>
          <button (click)="applyPreset('value')" [class.active]="presetActive === 'value'">Valor</button>
          <button (click)="applyPreset('quality')" [class.active]="presetActive === 'quality'">Qualidade</button>
          <button (click)="applyPreset('growth')" [class.active]="presetActive === 'growth'">Crescimento</button>
        </div>
      </div>

      <button class="search-btn" (click)="runScreener()" [disabled]="loading()">
        {{ loading() ? 'Buscando...' : 'Buscar Ativos' }}
      </button>

      @if (results().length) {
        <div class="results">
          <div class="results-header">
            <h3>Resultados ({{ results().length }})</h3>
          </div>
          <div class="results-grid">
            @for (result of results(); track result.symbol) {
              <a [routerLink]="['/market/detail', result.symbol]" class="result-card">
                <span class="symbol">{{ result.symbol }}</span>
                <span class="name">{{ result.name }}</span>
                <div class="metrics">
                  <span class="metric">PL: {{ result.priceToEarnings ?? '-' }}</span>
                  <span class="metric">PVP: {{ result.priceToBook ?? '-' }}</span>
                  <span class="metric">DY: {{ result.dividendYield ? (result.dividendYield | number:'1.2-2') + '%' : '-' }}</span>
                </div>
              </a>
            }
          </div>
        </div>
      } @else if (!loading() && searched()) {
        <div class="empty">Nenhum ativo encontrado com os filtros selecionados</div>
      }
    </div>
  `,
  styles: [`
    .screener-page { padding: var(--space-lg); max-width: 1100px; margin: 0 auto; }
    h1 { margin-bottom: var(--space-xs); }
    .subtitle { color: var(--text-secondary); margin-bottom: var(--space-lg); }
    .builder { background: var(--card); padding: var(--space-lg); border-radius: var(--radius-lg); margin-bottom: var(--space-lg); }
    .builder h3 { margin: 0 0 var(--space-md); font-size: var(--font-lg); }
    .filters-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md); }
    .filter-item { display: flex; flex-direction: column; gap: var(--space-xs); }
    .filter-item label { font-size: var(--font-sm); color: var(--text-secondary); }
    .filter-item input, .filter-item select { padding: var(--space-sm); background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); }
    .presets { margin-bottom: var(--space-lg); }
    .presets h3 { margin-bottom: var(--space-md); }
    .preset-buttons { display: flex; gap: var(--space-sm); flex-wrap: wrap; }
    .preset-buttons button {
      padding: var(--space-sm) var(--space-md);
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      cursor: pointer;
    }
    .preset-buttons button.active { background: var(--primary); border-color: var(--primary); }
    .search-btn { width: 100%; padding: var(--space-md); background: var(--primary); border: none; border-radius: var(--radius-md); color: white; font-weight: 600; cursor: pointer; }
    .search-btn:disabled { opacity: 0.6; }
    .results { margin-top: var(--space-lg); }
    .results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); }
    .results-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--space-md); }
    .result-card { display: block; padding: var(--space-md); background: var(--card); border-radius: var(--radius-md); text-decoration: none; border: 1px solid var(--border); }
    .result-card:hover { border-color: var(--primary); }
    .symbol { display: block; font-weight: 600; color: var(--primary-light); }
    .name { display: block; font-size: var(--font-sm); color: var(--text-secondary); margin-bottom: var(--space-sm); }
    .metrics { display: flex; gap: var(--space-sm); font-size: var(--font-xs); color: var(--text-muted); }
    .metric { background: var(--bg); padding: 2px 6px; border-radius: var(--radius-sm); }
    .empty { text-align: center; padding: var(--space-2xl); color: var(--text-secondary); }
    @media (max-width: 768px) {
      .filters-grid { grid-template-columns: repeat(2, 1fr); }
      .results-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class ScreenerComponent {
  private api = inject(ApiService);


  filters = {
    category: '',
    maxPe: null as number | null,
    maxPb: null as number | null,
    minDy: null as number | null,
    minRoe: null as number | null,
    sector: ''
  };


  presetActive = '';
  loading = signal(false);
  searched = signal(false);
  results = signal<Asset[]>([]);

  applyPreset(preset: string) {
    this.presetActive = preset;
    if (preset === 'dividends') {
      this.filters = { category: '', maxPe: 20, maxPb: null, minDy: 5, minRoe: null, sector: '' };
    } else if (preset === 'value') {
      this.filters = { category: '', maxPe: null, maxPb: 1.5, minDy: null, minRoe: null, sector: '' };
    } else if (preset === 'quality') {
      this.filters = { category: '', maxPe: 25, maxPb: null, minDy: null, minRoe: 15, sector: '' };
    } else if (preset === 'growth') {
      this.filters = { category: '', maxPe: 30, maxPb: null, minDy: null, minRoe: 20, sector: '' };
    }
  }

  runScreener() {
    this.loading.set(true);
    this.searched.set(true);
    this.api.runScreener({
      category: this.filters.category || null,
      maxPe: this.filters.maxPe,
      maxPb: this.filters.maxPb,
      minDy: this.filters.minDy,
      minRoe: this.filters.minRoe,
      sector: this.filters.sector || null
    }).subscribe({
      next: data => {
        this.results.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
