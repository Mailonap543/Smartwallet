import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, Asset, Wallet } from '../../services/api.service';

interface Holding {
  asset: Asset;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="wallet-page">
      <header class="wallet-hero">
        <div>
          <span class="eyebrow">Carteira inteligente</span>
          <h1>Minha Carteira</h1>
          <p>Acompanhe sua evolucao, ativos e movimentacoes em um so lugar.</p>
        </div>

        <div class="hero-actions">
          <button class="soft-action" type="button" routerLink="/market">
            <span class="material-symbols-rounded" aria-hidden="true">monitoring</span>
            Buscar ativos
          </button>
          <button class="primary-action" type="button" (click)="showAddModal = true">
            <span class="material-symbols-rounded" aria-hidden="true">add</span>
            Nova movimentacao
          </button>
        </div>
      </header>

      <section class="summary" aria-label="Resumo da carteira">
        <article class="summary-card total">
          <span class="summary-icon material-symbols-rounded" aria-hidden="true">account_balance_wallet</span>
          <span class="label">Patrimonio Total</span>
          <strong>{{ totalValue | currency:'BRL' }}</strong>
          <small>Valor atual consolidado</small>
        </article>
        <article class="summary-card">
          <span class="summary-icon material-symbols-rounded" aria-hidden="true">trending_up</span>
          <span class="label">Lucro/Prejuizo</span>
          <strong [class.positive]="totalPL >= 0" [class.negative]="totalPL < 0">
            {{ totalPL >= 0 ? '+' : '' }}{{ totalPL | currency:'BRL' }}
          </strong>
          <small [class.positive]="totalPL >= 0" [class.negative]="totalPL < 0">{{ totalPLPercent | number:'1.2-2' }}%</small>
        </article>
        <article class="summary-card">
          <span class="summary-icon material-symbols-rounded" aria-hidden="true">payments</span>
          <span class="label">Total Investido</span>
          <strong>{{ totalInvested | currency:'BRL' }}</strong>
          <small>Capital aplicado</small>
        </article>
      </section>

      <nav class="tabs" aria-label="Navegacao da carteira">
        <button [class.active]="activeTab === 'holdings'" (click)="activeTab = 'holdings'">
          <span class="material-symbols-rounded" aria-hidden="true">inventory_2</span>
          Ativos
        </button>
        <button [class.active]="activeTab === 'transactions'" (click)="activeTab = 'transactions'">
          <span class="material-symbols-rounded" aria-hidden="true">swap_vert</span>
          Movimentacoes
        </button>
        <button [class.active]="activeTab === 'dividends'" (click)="activeTab = 'dividends'">
          <span class="material-symbols-rounded" aria-hidden="true">redeem</span>
          Proventos
        </button>
      </nav>

      @if (activeTab === 'holdings') {
        <section class="holdings-panel">
          <div class="panel-header">
            <div>
              <h2>Seus ativos</h2>
              <p>{{ holdings.length }} ativo(s) nesta carteira</p>
            </div>
            <button class="icon-action" type="button" aria-label="Mais opcoes">
              <span class="material-symbols-rounded" aria-hidden="true">more_horiz</span>
            </button>
          </div>

          @if (holdings.length) {
            <div class="holdings-list">
              @for (holding of holdings; track holding.asset.symbol) {
                <a class="holding-row" [routerLink]="['/market/detail', holding.asset.symbol]">
                  <div class="asset-badge">{{ holding.asset.symbol.charAt(0) }}</div>
                  <div class="asset-col">
                    <span class="symbol">{{ holding.asset.symbol }}</span>
                    <span class="name">{{ holding.asset.name }}</span>
                  </div>
                  <div class="metric">
                    <span>{{ holding.quantity | number:'1.0-4' }}</span>
                    <small>Quantidade</small>
                  </div>
                  <div class="metric">
                    <span>{{ holding.avgPrice | currency:'BRL' }}</span>
                    <small>Preco medio</small>
                  </div>
                  <div class="metric value-col">
                    <span>{{ holding.totalValue | currency:'BRL' }}</span>
                    <small [class.positive]="holding.profitLoss >= 0" [class.negative]="holding.profitLoss < 0">
                      {{ holding.profitLoss >= 0 ? '+' : '' }}{{ holding.profitLossPercent | number:'1.2-2' }}%
                    </small>
                  </div>
                  <span class="row-arrow material-symbols-rounded" aria-hidden="true">chevron_right</span>
                </a>
              }
            </div>
          } @else {
            <div class="empty-state">
              <span class="material-symbols-rounded" aria-hidden="true">account_balance_wallet</span>
              <h3>Nenhum ativo ainda</h3>
              <p>Adicione sua primeira movimentacao para montar sua carteira.</p>
              <button class="primary-action" type="button" (click)="showAddModal = true">
                <span class="material-symbols-rounded" aria-hidden="true">add</span>
                Adicionar ativo
              </button>
            </div>
          }
        </section>
      } @else if (activeTab === 'transactions') {
        <section class="empty-panel">
          <span class="material-symbols-rounded" aria-hidden="true">swap_vert</span>
          <h2>Movimentacoes</h2>
          <p>As compras, vendas e ajustes da carteira vao aparecer aqui.</p>
          <button class="primary-action" type="button" (click)="showAddModal = true">
            <span class="material-symbols-rounded" aria-hidden="true">add</span>
            Nova movimentacao
          </button>
        </section>
      } @else {
        <section class="empty-panel">
          <span class="material-symbols-rounded" aria-hidden="true">redeem</span>
          <h2>Proventos</h2>
          <p>Dividendos e rendimentos serao organizados nesta aba.</p>
        </section>
      }
    </div>
  `,
  styles: [`
    .wallet-page {
      min-height: 100%;
      padding: 28px;
      color: #0f172a;
    }

    .wallet-hero {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding: 24px;
      border: 1px solid rgba(16, 185, 129, 0.16);
      border-radius: 26px;
      background:
        radial-gradient(circle at 12% 0%, rgba(16, 185, 129, 0.18), transparent 34%),
        linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(239, 253, 246, 0.86));
      box-shadow: 0 22px 60px rgba(15, 23, 42, 0.1);
    }

    .eyebrow {
      display: block;
      margin-bottom: 8px;
      color: #07814d;
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    h1, h2, h3, p {
      margin: 0;
    }

    h1 {
      font-size: 38px;
      line-height: 1;
    }

    .wallet-hero p,
    .panel-header p,
    .empty-state p,
    .empty-panel p {
      margin-top: 8px;
      color: #64748b;
      font-size: 14px;
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: flex-end;
    }

    .primary-action,
    .soft-action,
    .icon-action {
      min-height: 46px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 0;
      border-radius: 15px;
      font-weight: 900;
      cursor: pointer;
      transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease;
    }

    .primary-action {
      padding: 0 18px;
      color: #fff;
      background: linear-gradient(135deg, #6729ff, #3187ff 48%, #27e29b);
      box-shadow: 0 18px 42px rgba(16, 185, 129, 0.22);
    }

    .soft-action {
      padding: 0 16px;
      color: #0f8b59;
      background: rgba(255, 255, 255, 0.76);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .primary-action:hover,
    .soft-action:hover,
    .icon-action:hover {
      transform: translateY(-2px);
      box-shadow: 0 22px 52px rgba(15, 23, 42, 0.14);
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin: 18px 0;
    }

    .summary-card {
      min-height: 152px;
      display: grid;
      align-content: center;
      gap: 7px;
      padding: 22px;
      overflow: hidden;
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 22px;
      background: rgba(255, 255, 255, 0.86);
      box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
    }

    .summary-card.total {
      color: #fff;
      background:
        radial-gradient(circle at 90% 12%, rgba(39, 226, 155, 0.28), transparent 32%),
        linear-gradient(145deg, #0f172a, #123c37);
    }

    .summary-icon {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      border-radius: 15px;
      color: #0f8b59;
      background: rgba(16, 185, 129, 0.12);
    }

    .summary-card.total .summary-icon {
      color: #fff;
      background: rgba(255, 255, 255, 0.13);
    }

    .summary-card .label,
    .summary-card small {
      color: #64748b;
      font-size: 13px;
      font-weight: 700;
    }

    .summary-card.total .label,
    .summary-card.total small {
      color: rgba(255, 255, 255, 0.72);
    }

    .summary-card strong {
      font-size: 24px;
      line-height: 1.1;
    }

    .positive { color: #059669; }
    .negative { color: #dc2626; }

    .tabs {
      display: inline-flex;
      gap: 6px;
      padding: 6px;
      margin-bottom: 18px;
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.78);
      box-shadow: 0 16px 38px rgba(15, 23, 42, 0.06);
    }

    .tabs button {
      min-height: 42px;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 0 15px;
      border: 0;
      border-radius: 13px;
      color: #64748b;
      background: transparent;
      font-weight: 850;
      cursor: pointer;
      transition: color 160ms ease, background 160ms ease, box-shadow 160ms ease;
    }

    .tabs button.active {
      color: #fff;
      background: linear-gradient(135deg, #16a467, #0f8b59);
      box-shadow: 0 12px 26px rgba(16, 185, 129, 0.18);
    }

    .holdings-panel,
    .empty-panel {
      padding: 22px;
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.86);
      box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 16px;
    }

    .icon-action {
      width: 42px;
      color: #475569;
      background: rgba(15, 23, 42, 0.04);
    }

    .holdings-list {
      display: grid;
      gap: 10px;
    }

    .holding-row {
      display: grid;
      grid-template-columns: 48px minmax(180px, 1.4fr) repeat(3, minmax(110px, 1fr)) 28px;
      align-items: center;
      gap: 14px;
      min-height: 74px;
      padding: 12px 14px;
      border: 1px solid rgba(148, 163, 184, 0.14);
      border-radius: 18px;
      color: #0f172a;
      text-decoration: none;
      background: rgba(248, 250, 252, 0.74);
      transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
    }

    .holding-row:hover {
      transform: translateY(-2px);
      border-color: rgba(16, 185, 129, 0.22);
      box-shadow: 0 16px 36px rgba(15, 23, 42, 0.09);
    }

    .asset-badge {
      width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      border-radius: 16px;
      color: #fff;
      font-weight: 900;
      background: linear-gradient(145deg, #6729ff, #27e29b);
    }

    .asset-col .symbol,
    .metric span {
      display: block;
      font-weight: 900;
    }

    .asset-col .name,
    .metric small {
      display: block;
      margin-top: 4px;
      color: #64748b;
      font-size: 12px;
      font-weight: 700;
    }

    .metric {
      text-align: right;
    }

    .row-arrow {
      color: #94a3b8;
    }

    .empty-state,
    .empty-panel {
      display: grid;
      justify-items: center;
      gap: 10px;
      padding: 46px 22px;
      text-align: center;
    }

    .empty-state > .material-symbols-rounded,
    .empty-panel > .material-symbols-rounded {
      width: 64px;
      height: 64px;
      display: grid;
      place-items: center;
      border-radius: 22px;
      color: #0f8b59;
      font-size: 34px;
      background: rgba(16, 185, 129, 0.12);
    }

    @media (prefers-color-scheme: dark) {
      .wallet-page {
        color: #f8fafc;
      }

      .wallet-hero,
      .summary-card,
      .tabs,
      .holdings-panel,
      .empty-panel {
        border-color: rgba(124, 58, 237, 0.22);
        background:
          radial-gradient(circle at 12% 0%, rgba(124, 58, 237, 0.2), transparent 36%),
          rgba(13, 15, 40, 0.86);
      }

      .holding-row {
        color: #f8fafc;
        border-color: rgba(124, 58, 237, 0.18);
        background: rgba(10, 14, 38, 0.72);
      }

      .wallet-hero p,
      .panel-header p,
      .empty-state p,
      .empty-panel p,
      .asset-col .name,
      .metric small,
      .summary-card .label,
      .summary-card small {
        color: #b8c1dd;
      }
    }

    @media (max-width: 900px) {
      .wallet-page {
        padding: 18px;
      }

      .wallet-hero {
        align-items: flex-start;
        flex-direction: column;
      }

      .hero-actions,
      .primary-action,
      .soft-action {
        width: 100%;
      }

      .summary {
        grid-template-columns: 1fr;
      }

      .tabs {
        width: 100%;
        overflow-x: auto;
      }

      .tabs button {
        white-space: nowrap;
      }

      .holding-row {
        grid-template-columns: 48px 1fr 28px;
      }

      .metric {
        display: none;
      }
    }
  `]
})
export class WalletComponent implements OnInit {
  private api = inject(ApiService);
  activeTab: 'holdings' | 'transactions' | 'dividends' = 'holdings';
  holdings: Holding[] = [];
  totalValue = 0;
  totalPL = 0;
  totalPLPercent = 0;
  totalInvested = 0;
  showAddModal = false;
  wallets: Wallet[] = [];
  selectedWalletId: number | null = null;

  ngOnInit() {
    this.loadWallets();
  }

  loadWallets() {
    this.api.getWallets().subscribe({
      next: wallets => {
        this.wallets = wallets;
        if (wallets.length) {
          this.selectedWalletId = wallets[0].id;
          this.loadAssets(wallets[0].id);
        }
      }
    });
  }

  loadAssets(walletId: number) {
    this.api.getWalletAssets(walletId).subscribe({
      next: assets => {
        this.holdings = assets.map(a => ({
          asset: a,
          quantity: a.quantity || 0,
          avgPrice: a.purchasePrice || 0,
          currentPrice: a.currentPrice || a.purchasePrice || 0,
          totalValue: (a.currentPrice || a.purchasePrice || 0) * (a.quantity || 0),
          profitLoss: ((a.currentPrice || a.purchasePrice || 0) - (a.purchasePrice || 0)) * (a.quantity || 0),
          profitLossPercent: a.purchasePrice ? (((a.currentPrice || a.purchasePrice || 0) - a.purchasePrice) / a.purchasePrice) * 100 : 0
        }));
        this.totalValue = this.holdings.reduce((sum, h) => sum + h.totalValue, 0);
        this.totalPL = this.holdings.reduce((sum, h) => sum + h.profitLoss, 0);
        this.totalInvested = this.totalValue - this.totalPL;
        this.totalPLPercent = this.totalInvested ? (this.totalPL / this.totalInvested) * 100 : 0;
      }
    });
  }
}
