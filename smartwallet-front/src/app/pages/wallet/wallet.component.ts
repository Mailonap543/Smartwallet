import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Asset, Wallet } from '../../services/api.service';
import { CardComponent } from '../../shared/components/card-input.component';
import { ButtonComponent } from '../../shared/components/button.component';

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
  imports: [CommonModule, RouterLink, CardComponent, ButtonComponent],
  template: `
    <div class="wallet-page">
      <h1>Minha Carteira</h1>

      
      <div class="summary">
        <div class="summary-card">
          <span class="label">Patrimônio Total</span>
          <span class="value">{{ totalValue | currency:'BRL' }}</span>
        </div>
        <div class="summary-card">
          <span class="label">Lucro/Prejuízo</span>
          <span class="value" [class.positive]="totalPL >= 0" [class.negative]="totalPL < 0">
            {{ totalPL >= 0 ? '+' : '' }}{{ totalPL | currency:'BRL' }}
            ({{ totalPLPercent | number:'1.2-2' }}%)
          </span>
        </div>
        <div class="summary-card">
          <span class="label">Total Investido</span>
          <span class="value">{{ totalInvested | currency:'BRL' }}</span>
        </div>
      </div>

      <div class="tabs">
        <button [class.active]="activeTab === 'holdings'" (click)="activeTab = 'holdings'">Ativos</button>
        <button [class.active]="activeTab === 'transactions'" (click)="activeTab = 'transactions'">Movimentações</button>
        <button [class.active]="activeTab === 'dividends'" (click)="activeTab = 'dividends'">Proventos</button>
      </div>

      @if (activeTab === 'holdings') {
        <div class="holdings-list">
          @for (holding of holdings; track holding.asset.symbol) {
            <app-card [hoverable]="true" [routerLink]="['/market/detail', holding.asset.symbol]">
              <div class="asset-col">
                <span class="symbol">{{ holding.asset.symbol }}</span>
                <span class="name">{{ holding.asset.name }}</span>
              </div>
              <div class="qty-col">
                <span class="qty">{{ holding.quantity | number:'1.0-4' }}</span>
                <span class="label">quantidade</span>
              </div>
              <div class="avg-col">
                <span class="avg">{{ holding.avgPrice | currency:'BRL' }}</span>
                <span class="label">preço médio</span>
              </div>
              <div class="value-col">
                <span class="value">{{ holding.totalValue | currency:'BRL' }}</span>
                <span class="pl" [class.positive]="holding.profitLoss >= 0" [class.negative]="holding.profitLoss < 0">
                  {{ holding.profitLoss >= 0 ? '+' : '' }}{{ holding.profitLossPercent | number:'1.2-2' }}%
                </span>
              </div>
            </app-card>
          }
        </div>
      }

      <app-button variant="primary" (onClick)="showAddModal = true">+ Nova Movimentação</app-button>
    </div>
  `,
  styles: [`
    .wallet-page { padding: var(--space-lg); max-width: 1200px; margin: 0 auto; }
    h1 { margin-bottom: var(--space-lg); }
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md); margin-bottom: var(--space-lg); }
    .summary-card { background: var(--card); padding: var(--space-lg); border-radius: var(--radius-md); text-align: center; }
    .summary-card .label { display: block; font-size: var(--font-sm); color: var(--text-secondary); margin-bottom: var(--space-xs); }
    .summary-card .value { font-size: var(--font-xl); font-weight: bold; }
    .positive { color: var(--success); }
    .negative { color: var(--error); }
    .tabs { display: flex; gap: var(--space-sm); margin-bottom: var(--space-lg); border-bottom: 1px solid var(--border); }
    .tabs button { padding: var(--space-md); background: none; border: none; color: var(--text-secondary); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; }
    .tabs button.active { color: var(--primary); border-bottom-color: var(--primary); }
    .holdings-list { display: flex; flex-direction: column; gap: var(--space-sm); margin-bottom: var(--space-lg); }
    .holdings-list app-card { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: var(--space-md); align-items: center; }
    .asset-col .symbol { font-weight: 600; display: block; }
    .asset-col .name { font-size: var(--font-sm); color: var(--text-secondary); }
    .qty-col, .avg-col, .value-col { text-align: right; }
    .qty-col .label, .avg-col .label, .value-col .label { font-size: var(--font-xs); color: var(--text-muted); display: block; }
    .value-col .value { font-weight: 600; display: block; }
    .value-col .pl { font-size: var(--font-sm); }
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

  ngOnInit() {
    this.holdings = Array(5).fill(0).map((_, i) => ({
      asset: { symbol: ` Asset${i + 1}`, name: `Empresa ${i + 1}`, currentPrice: Math.random() * 100 } as Asset,
      quantity: Math.floor(Math.random() * 100),
      avgPrice: Math.random() * 100,
      currentPrice: Math.random() * 100,
      totalValue: Math.random() * 10000,
      profitLoss: Math.random() * 1000 - 500,
      profitLossPercent: Math.random() * 20 - 10
    }));
    this.totalValue = this.holdings.reduce((sum, h) => sum + h.totalValue, 0);
    this.totalPL = this.holdings.reduce((sum, h) => sum + h.profitLoss, 0);
    this.totalInvested = this.totalValue - this.totalPL;
    this.totalPLPercent = (this.totalPL / this.totalInvested) * 100;
  }
}
