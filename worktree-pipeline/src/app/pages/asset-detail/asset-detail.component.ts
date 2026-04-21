import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService, Asset } from '../../services/api.service';
import { LoadingComponent } from '../../shared/components/loading.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { CardComponent } from '../../shared/components/card-input.component';

@Component({
  selector: 'app-asset-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent, ButtonComponent, CardComponent],
  template: `
    <div class="asset-detail">
      @if (loading) {
        <app-loading message="Carregando dados..." />
      } @else if (asset) {
        <div class="header animate-fade-in">
          <a routerLink="/market" class="back-link">← Voltar ao mercado</a>


          <div class="asset-header">
            <div class="asset-icon">
              @if (asset.logoUrl) {
                <img [src]="asset.logoUrl" [alt]="asset.name" />
              } @else {
                <span class="icon-placeholder">{{ asset.symbol.charAt(0) }}</span>
              }
            </div>
            <div class="asset-info">
              <h1>{{ asset.symbol }}</h1>
              <p class="name">{{ asset.name }}</p>
              <p class="category">{{ asset.category?.name }}</p>
            </div>
            <div class="price-info">
              <span class="price">{{ asset.currentPrice | number:'1.2-2' }}</span>
              <span class="change" [class.positive]="(asset.changePercent ?? 0) >= 0" [class.negative]="(asset.changePercent ?? 0) < 0">
                {{ asset.changePercent! > 0 ? '+' : '' }}{{ asset.changePercent | number:'1.2-2' }}%
              </span>
            </div>
          </div>


          <div class="actions">
            <app-button variant="primary" (onClick)="addToWallet()">+ Adicionar à Carteira</app-button>
            <app-button variant="secondary" (onClick)="addToCompare()">Comparar</app-button>
            <app-button variant="ghost" (onClick)="toggleFavorite()">
              {{ isFavorite ? '★' : '☆' }} Favorito
            </app-button>
          </div>
        </div>

        <!-- Chart Section -->
        <div class="chart-section">
          <div class="chart-periods">
            <button [class.active]="period() === '1D'" (click)="setPeriod('1D')">1D</button>
            <button [class.active]="period() === '1M'" (click)="setPeriod('1M')">1M</button>
            <button [class.active]="period() === '3M'" (click)="setPeriod('3M')">3M</button>
            <button [class.active]="period() === '6M'" (click)="setPeriod('6M')">6M</button>
            <button [class.active]="period() === '1A'" (click)="setPeriod('1A')">1A</button>
            <button [class.active]="period() === 'ALL'" (click)="setPeriod('ALL')">ALL</button>
          </div>
          <div class="chart-placeholder">
            <p class="chart-text">Gráfico de cotação: {{ period() }}</p>
            <p class="chart-subtext">Dados históricos do ativo</p>
            <p class="chart-subtext">Dados históricos serão carregados via API</p>
          </div>
        </div>

        <div class="sections">
          <app-card>
            <h3>Informações</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Empresa</span>
                <span class="value">{{ asset.companyName || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Setor</span>
                <span class="value">{{ asset.segment || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">website</span>
                <span class="value"><a [href]="asset.website" target="_blank">{{ asset.website || '-' }}</a></span>
              </div>
            </div>
          </app-card>

          <app-card>
            <h3>Indicadores Fundamentalistas</h3>
            <div class="indicators-grid">
              <div class="indicator">
                <span class="label">P/L</span>
                <span class="value">{{ asset.priceToEarnings || '-' }}</span>
              </div>
              <div class="indicator">
                <span class="label">P/VP</span>
                <span class="value">{{ asset.priceToBook || '-' }}</span>
              </div>
              <div class="indicator">
                <span class="label">Dividend Yield</span>
                <span class="value">{{ asset.dividendYield ? (asset.dividendYield | number:'1.2-2') + '%' : '-' }}</span>
              </div>
              <div class="indicator">
                <span class="label">ROE</span>
                <span class="value">{{ asset.roe ? (asset.roe | number:'1.2-2') + '%' : '-' }}</span>
              </div>
              <div class="indicator">
                <span class="label">Recita</span>
                <span class="value">{{ asset.revenue ? (asset.revenue | number:'1.0-0') : '-' }}</span>
              </div>
              <div class="indicator">
                <span class="label">Lucro Líquido</span>
                <span class="value">{{ asset.netIncome ? (asset.netIncome | number:'1.0-0') : '-' }}</span>
              </div>
              <div class="indicator">
                <span class="label">Margem Líquida</span>
                <span class="value">{{ calculateMargin() }}</span>
              </div>
              <div class="indicator">
                <span class="label">Div. EBITDA</span>
                <span class="value">{{ calculateDebt() }}</span>
              </div>
            </div>
          </app-card>

          <app-card>
            <h3>Cotações</h3>
            <div class="quote-info">
              <div class="quote-item">
                <span class="label">Máxima 52 sem.</span>
                <span class="value">{{ asset.high52w ? (asset.high52w | number:'1.2-2') : '-' }}</span>
              </div>
              <div class="quote-item">
                <span class="label">Mínima 52 sem.</span>
                <span class="value">{{ asset.low52w ? (asset.low52w | number:'1.2-2') : '-' }}</span>
              </div>
              <div class="quote-item">
                <span class="label">Volume</span>
                <span class="value">{{ asset.dayVolume | number:'1.0-0' }}</span>
              </div>
              <div class="quote-item">
                <span class="label">Market Cap</span>
                <span class="value">{{ asset.marketCap ? (asset.marketCap | number:'1.0-0') : '-' }}</span>
              </div>
            </div>
          </app-card>
        </div>

        <div class="sections">
          <app-card>
            <h3>Fatos Relevantes</h3>
            @if (facts.length === 0) {
              <p class="muted">Sem fatos relevantes recentes.</p>
            } @else {
              <ul class="facts">
                @for (fact of facts; track fact.id) {
                  <li>
                    <div class="fact-title">{{ fact.title }}</div>
                    <div class="fact-date">{{ fact.eventDate }}</div>
                    <div class="fact-desc">{{ fact.description }}</div>
                  </li>
                }
              </ul>
            }
          </app-card>

          <app-card>
            <h3>Resultados</h3>
            @if (earnings.length === 0) {
              <p class="muted">Sem resultados recentes.</p>
            } @else {
              <table class="earnings-table">
                <thead>
                  <tr><th>Período</th><th>Data</th><th>Receita</th><th>Lucro</th><th>EPS</th></tr>
                </thead>
                <tbody>
                  @for (e of earnings; track e.eventDate) {
                    <tr>
                      <td>{{ e.period || e.periodo }}</td>
                      <td>{{ e.eventDate || e.date }}</td>
                      <td>{{ e.revenue || e.receita | number:'1.0-0' }}</td>
                      <td>{{ e.netIncome || e.lucro | number:'1.0-0' }}</td>
                      <td>{{ e.earningsPerShare || e.eps | number:'1.2-2' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </app-card>
        </div>
      } @else {
        <div class="not-found">
          <p>Ativo não encontrado</p>
          <a routerLink="/market">Voltar ao mercado</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .asset-detail { padding: var(--space-lg); max-width: 1200px; margin: 0 auto; }
    .back-link { color: var(--text-secondary); font-size: var(--font-sm); display: block; margin-bottom: var(--space-md); }
    .asset-header { display: flex; align-items: center; gap: var(--space-lg); margin-bottom: var(--space-lg); }
    .asset-icon { width: 64px; height: 64px; border-radius: var(--radius-md); overflow: hidden; background: var(--card); display: flex; align-items: center; justify-content: center; }
    .asset-icon img { width: 100%; height: 100%; object-fit: cover; }
    .icon-placeholder { font-size: var(--font-xl); font-weight: bold; color: var(--primary); }
    .asset-info h1 { margin: 0; font-size: var(--font-2xl); }
    .asset-info .name { margin: var(--space-xs) 0; color: var(--text-secondary); }
    .asset-info .category { font-size: var(--font-sm); color: var(--text-muted); }
    .price-info { margin-left: auto; text-align: right; }
    .price-info .price { font-size: var(--font-2xl); font-weight: bold; display: block; }
    .price-info .change { font-size: var(--font-lg); }
    .change.positive { color: var(--success); }
    .change.negative { color: var(--error); }
    .actions { display: flex; gap: var(--space-md); margin-bottom: var(--space-xl); }
    .chart-section { margin-bottom: var(--space-xl); }
    .chart-section .chart-periods {
      display: flex;
      gap: var(--space-xs);
      margin-bottom: var(--space-md);
    }
    .chart-section .chart-periods button {
      padding: var(--space-xs) var(--space-md);
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      cursor: pointer;
    }
    .chart-section .chart-periods button.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }
    .chart-placeholder {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-2xl);
      text-align: center;
    }
    .chart-text {
      font-size: var(--font-lg);
      color: var(--text-primary);
      margin-bottom: var(--space-xs);
    }
    .chart-subtext {
      color: var(--text-muted);
      font-size: var(--font-sm);
    }
    .sections { display: grid; gap: var(--space-lg); }
    .sections h3 { margin: 0 0 var(--space-md); font-size: var(--font-lg); }
    .info-grid, .indicators-grid, .quote-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-md); }
    .info-item, .indicator, .quote-item { display: flex; flex-direction: column; gap: var(--space-xs); }
    .label { font-size: var(--font-sm); color: var(--text-muted); }
    .value { font-size: var(--font-md); font-weight: 500; }
    .value a { color: var(--primary-light); }
    .facts { list-style: none; padding: 0; margin: 0; display: grid; gap: var(--space-sm); }
    .fact-title { font-weight: 600; }
    .fact-date { font-size: var(--font-xs); color: var(--text-muted); }
    .fact-desc { font-size: var(--font-sm); color: var(--text-secondary); }
    .earnings-table { width: 100%; border-collapse: collapse; }
    .earnings-table th, .earnings-table td { padding: var(--space-xs); border-bottom: 1px solid var(--border); text-align: left; }
    .muted { color: var(--text-muted); }
    .not-found { text-align: center; padding: var(--space-2xl); }
    .not-found a { color: var(--primary-light); }
  `]
})
export class AssetDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);


  asset: Asset | null = null;
  loading = true;
  isFavorite = false;
  period = signal('3M');
  dividends: any[] = [];
  earnings: any[] = [];
  history: any[] = [];
  facts: any[] = [];

  setPeriod(p: string) {
    this.period.set(p);
  }

  ngOnInit() {
    const symbol = this.route.snapshot.paramMap.get('symbol');
    if (symbol) {
      this.api.getAssetBySymbol(symbol).subscribe({
        next: (asset) => { this.asset = asset; this.loading = false; },
        error: () => { this.loading = false; }
      });
      this.api.getDividendsBySymbol(symbol).subscribe({ next: d => this.dividends = d });
      this.api.getEarningsBySymbol(symbol).subscribe({ next: e => this.earnings = e });
      this.api.getHistory(symbol, this.period()).subscribe({ next: h => this.history = h });
      this.api.getFactsBySymbol(symbol).subscribe({ next: f => this.facts = f });
    }
  }

  calculateMargin(): string {
    if (this.asset?.revenue && this.asset?.netIncome) {
      return ((this.asset.netIncome / this.asset.revenue) * 100).toFixed(2) + '%';
    }
    return '-';
  }

  calculateDebt(): string {
    if (this.asset?.totalDebt && this.asset?.cash) {
      return (this.asset.totalDebt / this.asset.cash).toFixed(2);
    }
    return '-';
  }

  addToWallet() { console.log('add to wallet'); }
  addToCompare() { console.log('add to compare'); }
  toggleFavorite() { this.isFavorite = !this.isFavorite; }
}
