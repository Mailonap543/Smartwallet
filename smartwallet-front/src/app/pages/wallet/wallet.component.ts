import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService, Asset, Wallet, BankInstitution, Transaction, AssetPaymentResponse } from '../../services/api.service';

type WalletTab = 'holdings' | 'transactions' | 'payments' | 'dividends';

interface WalletAdminConfig {
  adminEditable: boolean;
  adminKey: string;
  defaultTab: WalletTab;
  routeTabAliases: Record<string, WalletTab>;
}

const WALLET_ADMIN_CONFIG: WalletAdminConfig = {
  adminEditable: true,
  adminKey: 'wallet.defaultTab',
  defaultTab: 'holdings',
  routeTabAliases: {
    assets: 'holdings',
    holdings: 'holdings',
    transactions: 'transactions',
    movimentacoes: 'transactions',
    payments: 'payments',
    pagamentos: 'payments',
    dividends: 'dividends',
    proventos: 'dividends'
  }
};

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
  imports: [CommonModule, RouterLink, FormsModule],
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
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">monitoring</span>
            Buscar ativos
          </button>
          <button class="primary-action" type="button" (click)="activeTab = 'payments'">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">add</span>
            Comprar acao
          </button>
        </div>
      </header>

      <section class="summary" aria-label="Resumo da carteira">
        <article class="summary-card total">
          <span class="summary-icon material-symbols-rounded notranslate" aria-hidden="true">account_balance_wallet</span>
          <span class="label">Patrimonio Total</span>
          <strong>{{ totalValue | currency:'BRL' }}</strong>
          <small>Valor atual consolidado</small>
        </article>
        <article class="summary-card">
          <span class="summary-icon material-symbols-rounded notranslate" aria-hidden="true">trending_up</span>
          <span class="label">Lucro/Prejuizo</span>
          <strong [class.positive]="totalPL >= 0" [class.negative]="totalPL < 0">
            {{ totalPL >= 0 ? '+' : '' }}{{ totalPL | currency:'BRL' }}
          </strong>
          <small [class.positive]="totalPL >= 0" [class.negative]="totalPL < 0">{{ totalPLPercent | number:'1.2-2' }}%</small>
        </article>
        <article class="summary-card">
          <span class="summary-icon material-symbols-rounded notranslate" aria-hidden="true">payments</span>
          <span class="label">Total Investido</span>
          <strong>{{ totalInvested | currency:'BRL' }}</strong>
          <small>Capital aplicado</small>
        </article>
      </section>

      <nav class="tabs" aria-label="Navegacao da carteira">
        <button [class.active]="activeTab === 'holdings'" (click)="activeTab = 'holdings'">
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">inventory_2</span>
          Ativos
        </button>
        <button [class.active]="activeTab === 'transactions'" (click)="activeTab = 'transactions'">
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">swap_vert</span>
          Movimentacoes
        </button>
        <button [class.active]="activeTab === 'payments'" (click)="activeTab = 'payments'">
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">payments</span>
          Pagamento de acoes
        </button>
        <button [class.active]="activeTab === 'dividends'" (click)="activeTab = 'dividends'">
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">redeem</span>
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
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">more_horiz</span>
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
                  <span class="row-arrow material-symbols-rounded notranslate" aria-hidden="true">chevron_right</span>
                </a>
              }
            </div>
          } @else {
            <div class="empty-state">
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">account_balance_wallet</span>
              <h3>Nenhum ativo ainda</h3>
              <p>Adicione sua primeira movimentacao para montar sua carteira.</p>
              <button class="primary-action" type="button" (click)="activeTab = 'payments'">
                <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">add</span>
                Comprar ativo
              </button>
            </div>
          }
        </section>
      } @else if (activeTab === 'transactions') {
        @if (transactions.length) {
          <section class="transactions-panel">
            <div class="panel-header">
              <div>
                <h2>Movimentacoes</h2>
                <p>{{ transactions.length }} registro(s) de compra, venda e proventos</p>
              </div>
              <button class="primary-action compact" type="button" (click)="activeTab = 'payments'">
                <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">add_card</span>
                Comprar
              </button>
            </div>

            <div class="transactions-list">
              @for (transaction of transactions; track transaction.id) {
                <article class="transaction-row">
                  <span class="transaction-icon material-symbols-rounded notranslate" translate="no" aria-hidden="true">
                    {{ transaction.transactionType === 'SELL' ? 'south_west' : transaction.transactionType === 'DIVIDEND' ? 'redeem' : 'north_east' }}
                  </span>
                  <div>
                    <strong>{{ transaction.transactionType }}</strong>
                    <small>{{ transaction.transactionDate | date:'dd/MM/yyyy' }} · {{ transaction.notes || 'Movimentacao registrada' }}</small>
                  </div>
                  <span>{{ transaction.quantity | number:'1.0-4' }} x {{ transaction.price | currency:'BRL' }}</span>
                  <strong>{{ transaction.totalValue | currency:'BRL' }}</strong>
                </article>
              }
            </div>
          </section>
        } @else {
          <section class="empty-panel">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">swap_vert</span>
            <h2>Movimentacoes</h2>
            <p>As compras, vendas e ajustes da carteira vao aparecer aqui.</p>
            <button class="primary-action" type="button" (click)="activeTab = 'payments'">
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">add</span>
              Comprar acao
            </button>
          </section>
        }
      } @else if (activeTab === 'payments') {
        <section class="payment-panel">
          <div class="panel-header">
            <div>
              <h2>Comprar ações com banco digital</h2>
              <p>Escolha a carteira, o banco e registre a compra como pagamento aprovado.</p>
            </div>
            <span class="payment-badge">
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">verified</span>
              Bancos integrados
            </span>
          </div>

          <form class="asset-payment-form" (ngSubmit)="submitAssetPayment()">
            <label>
              Carteira
              <select name="walletId" [(ngModel)]="selectedWalletId" (ngModelChange)="onWalletSelectionChange($event)">
                @for (wallet of wallets; track wallet.id) {
                  <option [ngValue]="wallet.id">{{ wallet.name }}</option>
                }
              </select>
            </label>

            <label>
              Banco
              <select name="institutionId" [(ngModel)]="assetPayment.institutionId">
                @for (bank of bankInstitutions; track bank.id) {
                  <option [value]="bank.id">{{ bank.name }} · {{ bank.country }}</option>
                }
              </select>
            </label>

            <label>
              Código
              <input name="symbol" type="text" [(ngModel)]="assetPayment.symbol" placeholder="PETR4" />
            </label>

            <label>
              Nome
              <input name="name" type="text" [(ngModel)]="assetPayment.name" placeholder="Petrobras PN" />
            </label>

            <label>
              Quantidade
              <input name="quantity" type="number" min="0.0001" step="0.0001" [(ngModel)]="assetPayment.quantity" />
            </label>

            <label>
              Preço
              <input name="price" type="number" min="0.01" step="0.01" [(ngModel)]="assetPayment.price" />
            </label>

            <label>
              Taxas
              <input name="fees" type="number" min="0" step="0.01" [(ngModel)]="assetPayment.fees" />
            </label>

            <label class="wide">
              Observação
              <input name="notes" type="text" [(ngModel)]="assetPayment.notes" placeholder="Compra via banco digital" />
            </label>

            <div class="payment-summary">
              <span>Total estimado</span>
              <strong>{{ assetPaymentTotal() | currency:'BRL' }}</strong>
            </div>

            <button class="primary-action pay-submit" type="submit" [disabled]="paymentSubmitting || !selectedWalletId">
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">add_card</span>
              {{ paymentSubmitting ? 'Processando...' : 'Pagar e adicionar na carteira' }}
            </button>
          </form>

          @if (paymentResult) {
            <div class="payment-success">
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">check_circle</span>
              <div>
                <strong>{{ paymentResult.payment.institutionName }} aprovou o pagamento</strong>
                <small>{{ paymentResult.asset.symbol }} entrou na carteira · {{ paymentResult.payment.paymentId }}</small>
              </div>
            </div>
          }
        </section>
      } @else {
        <section class="empty-panel">
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">redeem</span>
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
    .transactions-panel,
    .payment-panel,
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

    .transactions-list {
      display: grid;
      gap: 10px;
    }

    .transaction-row {
      display: grid;
      grid-template-columns: 46px minmax(180px, 1fr) minmax(150px, auto) minmax(120px, auto);
      align-items: center;
      gap: 14px;
      min-height: 70px;
      padding: 12px 14px;
      border: 1px solid rgba(148, 163, 184, 0.14);
      border-radius: 18px;
      background: rgba(248, 250, 252, 0.74);
    }

    .transaction-icon {
      width: 46px;
      height: 46px;
      display: grid;
      place-items: center;
      border-radius: 15px;
      color: #0f8b59;
      background: rgba(16, 185, 129, 0.12);
    }

    .transaction-row strong,
    .transaction-row span {
      font-weight: 900;
    }

    .transaction-row small {
      display: block;
      margin-top: 4px;
      color: #64748b;
      font-size: 12px;
      font-weight: 700;
    }

    .compact {
      min-height: 42px;
      padding: 0 14px;
    }

    .payment-panel {
      display: grid;
      gap: 18px;
    }

    .payment-badge {
      min-height: 42px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0 12px;
      border-radius: 999px;
      color: #0f8b59;
      font-size: 12px;
      font-weight: 900;
      background: rgba(16, 185, 129, 0.12);
    }

    .asset-payment-form {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      align-items: end;
    }

    .asset-payment-form label {
      display: grid;
      gap: 7px;
      color: #475569;
      font-size: 12px;
      font-weight: 900;
    }

    .asset-payment-form input,
    .asset-payment-form select {
      width: 100%;
      min-height: 44px;
      border: 1px solid rgba(148, 163, 184, 0.22);
      border-radius: 14px;
      padding: 0 12px;
      color: #0f172a;
      background: rgba(248, 250, 252, 0.86);
      outline: 0;
    }

    .asset-payment-form input:focus,
    .asset-payment-form select:focus {
      border-color: rgba(16, 185, 129, 0.62);
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12);
    }

    .asset-payment-form .wide {
      grid-column: span 2;
    }

    .payment-summary {
      min-height: 58px;
      display: grid;
      align-content: center;
      gap: 3px;
      padding: 10px 14px;
      border: 1px solid rgba(16, 185, 129, 0.18);
      border-radius: 16px;
      background: rgba(236, 253, 245, 0.72);
    }

    .payment-summary span {
      color: #64748b;
      font-size: 12px;
      font-weight: 800;
    }

    .payment-summary strong {
      color: #047647;
      font-size: 20px;
    }

    .pay-submit {
      width: 100%;
    }

    .payment-success {
      display: grid;
      grid-template-columns: 48px minmax(0, 1fr);
      gap: 12px;
      align-items: center;
      padding: 14px;
      border: 1px solid rgba(16, 185, 129, 0.22);
      border-radius: 18px;
      color: #0f172a;
      background: rgba(236, 253, 245, 0.82);
    }

    .payment-success > .material-symbols-rounded {
      color: #059669;
      font-size: 38px;
    }

    .payment-success small {
      display: block;
      margin-top: 4px;
      color: #64748b;
      font-weight: 700;
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
      .transactions-panel,
      .payment-panel,
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

      .transaction-row,
      .payment-success {
        color: #f8fafc;
        border-color: rgba(124, 58, 237, 0.18);
        background: rgba(10, 14, 38, 0.72);
      }

      .asset-payment-form label,
      .transaction-row small,
      .payment-success small {
        color: #b8c1dd;
      }

      .asset-payment-form input,
      .asset-payment-form select {
        color: #f8fafc;
        border-color: rgba(124, 58, 237, 0.22);
        background: rgba(10, 14, 38, 0.72);
      }

      .payment-summary {
        border-color: rgba(39, 226, 155, 0.22);
        background: rgba(15, 23, 42, 0.72);
      }

      .wallet-hero p,
      .panel-header p,
      .empty-state p,
      .empty-panel p,
      .asset-col .name,
      .metric small,
      .payment-summary span,
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

      .transaction-row {
        grid-template-columns: 46px minmax(0, 1fr);
      }

      .transaction-row > span,
      .transaction-row > strong {
        grid-column: 2;
      }

      .asset-payment-form {
        grid-template-columns: 1fr;
      }

      .asset-payment-form .wide {
        grid-column: auto;
      }

      .metric {
        display: none;
      }
    }
  `]
})
export class WalletComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  activeTab: WalletTab = WALLET_ADMIN_CONFIG.defaultTab;
  holdings: Holding[] = [];
  transactions: Transaction[] = [];
  totalValue = 0;
  totalPL = 0;
  totalPLPercent = 0;
  totalInvested = 0;
  wallets: Wallet[] = [];
  selectedWalletId: number | null = null;
  private routeWalletId: number | null = null;
  bankInstitutions: BankInstitution[] = [];
  paymentSubmitting = false;
  paymentResult: AssetPaymentResponse | null = null;
  assetPayment = {
    institutionId: '',
    symbol: '',
    name: '',
    assetType: 'STOCK',
    quantity: 1,
    price: 0,
    fees: 0,
    notes: ''
  };

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.routeWalletId = this.parseWalletId(params.get('walletId'));
      this.activeTab = this.resolveTab(params.get('tab'));
      if (this.routeWalletId && this.wallets.length) {
        this.selectWallet(this.routeWalletId);
      }
    });

    this.loadWallets();
    this.loadBanks();
    this.loadTransactions();
  }

  loadWallets() {
    this.api.getWallets().subscribe({
      next: wallets => {
        this.wallets = wallets;
        if (wallets.length) {
          const preferredWalletId = this.getPreferredWalletId(wallets);
          this.selectWallet(preferredWalletId);
        }
      }
    });
  }

  onWalletSelectionChange(walletId: number | null) {
    if (walletId) {
      this.selectWallet(walletId);
    }
  }

  private selectWallet(walletId: number) {
    this.selectedWalletId = walletId;
    this.loadAssets(walletId);
  }

  private getPreferredWalletId(wallets: Wallet[]): number {
    const routeWallet = wallets.find(wallet => wallet.id === this.routeWalletId);
    return routeWallet?.id ?? wallets[0].id;
  }

  private parseWalletId(value: string | null): number | null {
    if (!value) {
      return null;
    }

    const walletId = Number(value);
    return Number.isFinite(walletId) && walletId > 0 ? walletId : null;
  }

  private resolveTab(tab: string | null): WalletTab {
    if (!tab) {
      return WALLET_ADMIN_CONFIG.defaultTab;
    }

    return WALLET_ADMIN_CONFIG.routeTabAliases[tab.toLowerCase()] ?? WALLET_ADMIN_CONFIG.defaultTab;
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

  loadTransactions() {
    this.api.getTransactions().subscribe({
      next: transactions => this.transactions = transactions
    });
  }

  loadBanks() {
    this.api.getBankInstitutions().subscribe({
      next: banks => {
        this.bankInstitutions = banks.filter(bank => bank.paymentEnabled);
        this.assetPayment.institutionId = this.bankInstitutions.find(bank => bank.id === 'nubank')?.id
          || this.bankInstitutions.find(bank => bank.id === 'mercado-pago')?.id
          || this.bankInstitutions[0]?.id
          || '';
      }
    });
  }

  assetPaymentTotal(): number {
    return (Number(this.assetPayment.quantity) || 0) * (Number(this.assetPayment.price) || 0) + (Number(this.assetPayment.fees) || 0);
  }

  submitAssetPayment() {
    if (!this.selectedWalletId || this.paymentSubmitting) {
      return;
    }

    this.paymentSubmitting = true;
    this.paymentResult = null;

    this.api.payAssetPurchase(this.selectedWalletId, {
      institutionId: this.assetPayment.institutionId,
      symbol: this.assetPayment.symbol.trim().toUpperCase(),
      name: this.assetPayment.name.trim() || this.assetPayment.symbol.trim().toUpperCase(),
      assetType: this.assetPayment.assetType,
      quantity: Number(this.assetPayment.quantity),
      price: Number(this.assetPayment.price),
      fees: Number(this.assetPayment.fees || 0),
      notes: this.assetPayment.notes
    }).subscribe({
      next: result => {
        this.paymentResult = result;
        this.paymentSubmitting = false;
        this.loadAssets(this.selectedWalletId as number);
        this.loadTransactions();
      },
      error: () => this.paymentSubmitting = false
    });
  }
}
