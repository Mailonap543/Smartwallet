import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ApiService, BankInstitution, BankPaymentResponse } from '../../services/api.service';

@Component({
  selector: 'app-banks',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="banks-page">
      <header class="banks-hero">
        <div>
          <h1>Bancos integrados</h1>
          <p>Pagamentos com bancos digitais, corretoras e contas internacionais dentro da Smartwallet.</p>
        </div>
        <span class="status-pill">
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">bolt</span>
          Pagamentos ativos
        </span>
      </header>

      <section class="bank-groups">
        @for (group of groupedBanks(); track group.key) {
          <article>
            <header>
              <div>
                <small>{{ group.banks.length }} integrações</small>
                <h2>{{ group.label }}</h2>
              </div>
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">{{ group.icon }}</span>
            </header>

            <div class="bank-list">
              @for (bank of group.banks; track bank.id) {
                <div class="bank-row">
                  <i [style.background]="bank.primaryColor || '#22e6ff'"></i>
                  <div>
                    <strong>{{ bank.name }}</strong>
                    <small>{{ bank.country }} · {{ bank.investmentEnabled ? 'Investimentos' : 'Conta digital' }}</small>
                  </div>
                  <span>{{ bank.paymentEnabled ? 'Pagar' : 'Conectar' }}</span>
                </div>
              }
            </div>
          </article>
        }
      </section>

      <section class="payment-history">
        <header>
          <div>
            <small>Histórico</small>
            <h2>Pagamentos recentes</h2>
          </div>
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">receipt_long</span>
        </header>

        @if (payments.length) {
          <div class="history-list">
            @for (payment of payments; track payment.paymentId) {
              <article>
                <span>{{ payment.institutionName }}</span>
                <strong>{{ payment.amount | currency:'BRL' }}</strong>
                <small>{{ payment.status }} · {{ payment.createdAt | date:'dd/MM/yyyy HH:mm' }}</small>
              </article>
            }
          </div>
        } @else {
          <div class="empty-history">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">account_balance</span>
            <p>Nenhum pagamento registrado ainda.</p>
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .banks-page {
      min-height: 100%;
      display: grid;
      gap: 14px;
      padding: 14px;
      color: #f8fbff;
      background:
        linear-gradient(rgba(0, 198, 255, 0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 198, 255, 0.035) 1px, transparent 1px),
        linear-gradient(145deg, #02040d 0%, #050b1c 50%, #02040d 100%);
      background-size: 36px 36px, 36px 36px, auto;
    }

    h1, h2, p {
      margin: 0;
    }

    .banks-hero,
    .bank-groups article,
    .payment-history {
      border: 1px solid rgba(0, 195, 255, 0.2);
      border-radius: 8px;
      background:
        linear-gradient(135deg, rgba(4, 12, 30, 0.9), rgba(2, 6, 18, 0.92)),
        linear-gradient(90deg, rgba(0, 195, 255, 0.08), transparent 42%, rgba(124, 58, 237, 0.09));
      box-shadow: 0 22px 64px rgba(0, 0, 0, 0.32), inset 0 0 36px rgba(0, 149, 255, 0.04);
    }

    .banks-hero {
      min-height: 118px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 22px 26px;
    }

    .banks-hero h1 {
      font-size: clamp(30px, 3vw, 42px);
      line-height: 1;
    }

    .banks-hero p {
      margin-top: 10px;
      color: #b8c5e8;
    }

    .status-pill {
      min-height: 42px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0 14px;
      border: 1px solid rgba(39, 226, 155, 0.28);
      border-radius: 8px;
      color: #27e29b;
      font-weight: 900;
      background: rgba(39, 226, 155, 0.08);
    }

    .bank-groups {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
    }

    .bank-groups article,
    .payment-history {
      padding: 18px;
    }

    .bank-groups header,
    .payment-history header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }

    small {
      color: #22e6ff;
      font-weight: 900;
      text-transform: uppercase;
    }

    h2 {
      margin-top: 4px;
      font-size: 20px;
    }

    .bank-list,
    .history-list {
      display: grid;
      gap: 10px;
    }

    .bank-row,
    .history-list article {
      display: grid;
      align-items: center;
      gap: 10px;
      min-height: 62px;
      padding: 12px;
      border: 1px solid rgba(0, 195, 255, 0.14);
      border-radius: 8px;
      background: rgba(3, 10, 28, 0.58);
    }

    .bank-row {
      grid-template-columns: 14px minmax(0, 1fr) auto;
    }

    .bank-row i {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      box-shadow: 0 0 16px currentColor;
    }

    .bank-row strong,
    .bank-row small {
      display: block;
    }

    .bank-row small {
      margin-top: 3px;
      color: #b8c5e8;
      font-size: 12px;
      text-transform: none;
      font-weight: 700;
    }

    .bank-row span {
      color: #00f5c8;
      font-size: 12px;
      font-weight: 900;
    }

    .history-list article {
      grid-template-columns: 1fr auto auto;
    }

    .history-list strong {
      color: #00f5c8;
    }

    .empty-history {
      display: grid;
      justify-items: center;
      gap: 10px;
      padding: 36px;
      color: #b8c5e8;
      text-align: center;
    }

    .empty-history .material-symbols-rounded {
      color: #8b5cf6;
      font-size: 42px;
    }

    @media (max-width: 1100px) {
      .bank-groups {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 720px) {
      .banks-hero {
        align-items: start;
        flex-direction: column;
      }

      .history-list article {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BanksComponent implements OnInit {
  private api = inject(ApiService);
  banks: BankInstitution[] = [];
  payments: BankPaymentResponse[] = [];

  ngOnInit() {
    this.api.getBankInstitutions().subscribe({
      next: banks => this.banks = banks
    });
    this.api.getBankPayments().subscribe({
      next: payments => this.payments = payments
    });
  }

  groupedBanks() {
    return [
      { key: 'BR_DIGITAL', label: 'Bancos digitais populares', icon: 'account_balance', banks: this.banks.filter(bank => bank.category === 'BR_DIGITAL') },
      { key: 'INVESTMENT', label: 'Focados em investimento', icon: 'show_chart', banks: this.banks.filter(bank => bank.category === 'INVESTMENT') },
      { key: 'INTERNATIONAL', label: 'Internacionais famosos', icon: 'public', banks: this.banks.filter(bank => bank.category === 'INTERNATIONAL') }
    ];
  }
}
