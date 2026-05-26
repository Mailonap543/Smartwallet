import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubscriptionService, Plan, PlanCheckoutResponse } from '../../services/subscription.service';
import { ApiService, BankInstitution } from '../../services/api.service';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="subscriptions-page">
      <header class="subscriptions-hero">
        <div>
          <h1>Assinaturas</h1>
          <p>Escolha o plano ideal e potencialize seus investimentos com tecnologia e inteligência.</p>
        </div>

        <div class="hero-status">
          <span>Jarvis mode</span>
          <strong>Ativo</strong>
          <i aria-hidden="true"></i>
        </div>
      </header>

      <section class="billing-band" aria-label="Ciclo de cobrança">
        <div class="billing-toggle">
          <button type="button" [class.active]="billingCycle === 'MONTHLY'" (click)="billingCycle = 'MONTHLY'">Mensal</button>
          <button type="button" [class.active]="billingCycle === 'ANNUAL'" (click)="billingCycle = 'ANNUAL'">Anual</button>
          <span>Economize até 20%</span>
        </div>

        <div class="billing-info">
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">calendar_month</span>
          <div>
            <strong>{{ billingCycle === 'ANNUAL' ? 'Plano anual' : 'Plano mensal' }}</strong>
            <small>{{ billingCycle === 'ANNUAL' ? 'Cobrança única anual' : 'Cobrança recorrente mensal' }}</small>
          </div>
        </div>

        <div class="billing-info guarantee">
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">verified</span>
          <div>
            <strong>Economia garantida</strong>
            <small>Pague com bancos digitais integrados</small>
          </div>
        </div>
      </section>

      @if (currentPlan) {
        <section class="current-plan">
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">workspace_premium</span>
          <div>
            <small>Seu plano atual</small>
            <strong>{{ currentPlan.planName }}</strong>
          </div>
          <p>{{ currentPlan.features?.slice(0, 3).join(' · ') }}</p>
        </section>
      }

      <section class="plans-grid" aria-label="Planos disponíveis">
        @for (plan of availablePlans; track plan.name) {
          <article class="plan-card" [class.featured]="plan.highlighted" [style.--accent]="plan.accentColor || '#22e6ff'">
            @if (plan.highlighted) {
              <div class="popular-badge">Mais escolhido</div>
            }

            <div class="plan-title">
              <span class="plan-icon material-symbols-rounded notranslate" translate="no" aria-hidden="true">{{ planIcon(plan) }}</span>
              <div>
                <h2>{{ planLabel(plan) }}</h2>
                <p>{{ plan.description }}</p>
              </div>
            </div>

            <div class="price-block">
              <strong>{{ priceFor(plan) | currency:'BRL':'symbol':'1.2-2' }}</strong>
              <span>/{{ billingCycle === 'ANNUAL' ? 'ano' : 'mês' }}</span>
              @if (billingCycle === 'ANNUAL') {
                <small>Equivale a {{ monthlyEquivalent(plan) | currency:'BRL':'symbol':'1.2-2' }}/mês</small>
              } @else {
                <small>{{ annualTotal(plan) | currency:'BRL':'symbol':'1.2-2' }}/ano</small>
              }
              @if (plan.annualDiscountPercent > 0) {
                <em>-{{ plan.annualDiscountPercent | number:'1.0-0' }}%</em>
              }
            </div>

            <ul class="feature-list">
              @for (feature of plan.features; track feature) {
                <li>
                  <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">check</span>
                  {{ feature }}
                </li>
              }
              @for (feature of plan.unavailableFeatures; track feature) {
                <li class="disabled">
                  <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">lock</span>
                  {{ feature }}
                </li>
              }
            </ul>

            @if (currentPlan?.plan === plan.name) {
              <button class="plan-button current" type="button" disabled>Plano atual</button>
            } @else {
              <button class="plan-button" type="button" [disabled]="activatingFree" (click)="selectPlan(plan)">
                {{ actionLabel(plan) }}
              </button>
            }
          </article>
        }
      </section>

      <section class="bank-strip" aria-label="Bancos integrados">
        <div class="trust-copy">
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">shield_lock</span>
          <div>
            <h2>Segurança e confiança</h2>
            <p>Pagamentos registrados com Pix simulado, histórico no backend e suporte aos principais bancos digitais.</p>
          </div>
        </div>

        <div class="bank-categories">
          @for (category of bankCategories(); track category.key) {
            <div>
              <strong>{{ category.label }}</strong>
              <span>{{ category.count }} bancos</span>
            </div>
          }
        </div>
      </section>

      @if (paymentPlan) {
        <div class="checkout-layer" role="dialog" aria-modal="true" aria-label="Pagamento do plano">
          <section class="checkout-modal">
            <header>
              <div>
                <small>Pagamento</small>
                <h2>{{ paymentPlan.displayName }}</h2>
              </div>
              <button type="button" aria-label="Fechar" (click)="closeCheckout()">
                <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">close</span>
              </button>
            </header>

            <div class="checkout-total">
              <span>Total</span>
              <strong>{{ priceFor(paymentPlan) | currency:'BRL':'symbol':'1.2-2' }}</strong>
            </div>

            <label class="bank-select">
              Banco para pagamento
              <select [(ngModel)]="selectedInstitutionId">
                @for (bank of bankInstitutions; track bank.id) {
                  <option [value]="bank.id">{{ bank.name }} · {{ categoryLabel(bank.category) }}</option>
                }
              </select>
            </label>

            <div class="checkout-banks">
              @for (bank of visibleBanks(); track bank.id) {
                <button type="button" [class.active]="selectedInstitutionId === bank.id" (click)="selectedInstitutionId = bank.id">
                  <i [style.background]="bank.primaryColor || '#22e6ff'"></i>
                  <span>{{ bank.name }}</span>
                </button>
              }
            </div>

            @if (checkoutResult?.payment; as payment) {
              <div class="payment-result">
                <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">check_circle</span>
                <div>
                  <strong>{{ payment.status }}</strong>
                  <small>{{ payment.institutionName }} · {{ payment.paymentId }}</small>
                </div>
              </div>
            }

            <button class="confirm-payment" type="button" [disabled]="checkingOut || !selectedInstitutionId" (click)="confirmCheckout()">
              {{ checkingOut ? 'Processando...' : 'Pagar e ativar plano' }}
            </button>
          </section>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .subscriptions-page {
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

    .subscriptions-hero,
    .billing-band,
    .current-plan,
    .bank-strip,
    .admin-pricing {
      border: 1px solid rgba(0, 195, 255, 0.2);
      border-radius: 8px;
      background:
        linear-gradient(135deg, rgba(4, 12, 30, 0.9), rgba(2, 6, 18, 0.92)),
        linear-gradient(90deg, rgba(0, 195, 255, 0.08), transparent 42%, rgba(124, 58, 237, 0.09));
      box-shadow: 0 22px 64px rgba(0, 0, 0, 0.32), inset 0 0 36px rgba(0, 149, 255, 0.04);
    }

    .subscriptions-hero {
      min-height: 118px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      padding: 22px 26px;
      position: relative;
      overflow: hidden;
    }

    .subscriptions-hero::after {
      position: absolute;
      inset: 0;
      pointer-events: none;
      content: '';
      background:
        linear-gradient(90deg, transparent 0%, rgba(0, 195, 255, 0.16) 50%, transparent 100%),
        linear-gradient(180deg, transparent 0%, rgba(124, 58, 237, 0.11) 52%, transparent 100%);
      mask: linear-gradient(#000, transparent 72%);
    }

    .subscriptions-hero h1 {
      position: relative;
      z-index: 1;
      font-size: clamp(30px, 3vw, 42px);
      line-height: 1;
      letter-spacing: 0;
    }

    .subscriptions-hero p {
      position: relative;
      z-index: 1;
      margin-top: 10px;
      color: #b8c5e8;
      font-size: 15px;
    }

    .hero-status {
      position: relative;
      z-index: 1;
      min-height: 42px;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 0 16px;
      border: 1px solid rgba(0, 195, 255, 0.24);
      border-radius: 8px;
      color: #22e6ff;
      text-transform: uppercase;
      font-size: 12px;
      font-weight: 900;
      background: rgba(2, 10, 28, 0.74);
    }

    .hero-status strong {
      color: #27e29b;
    }

    .hero-status i {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #27e29b;
      box-shadow: 0 0 16px rgba(39, 226, 155, 0.8);
    }

    .billing-band {
      display: grid;
      grid-template-columns: 1fr 216px 270px;
      gap: 14px;
      align-items: center;
      padding: 14px 18px;
    }

    .billing-toggle {
      width: max-content;
      max-width: 100%;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 5px;
      border: 1px solid rgba(0, 195, 255, 0.18);
      border-radius: 999px;
      background: rgba(2, 10, 28, 0.74);
    }

    .billing-toggle button {
      min-width: 112px;
      min-height: 34px;
      border: 0;
      border-radius: 999px;
      color: #d9e2ff;
      background: transparent;
      font-weight: 800;
    }

    .billing-toggle button.active {
      color: #fff;
      background: linear-gradient(135deg, #27116f, #4f2bd4);
      box-shadow: 0 0 22px rgba(124, 58, 237, 0.36);
    }

    .billing-toggle span {
      padding: 0 14px 0 8px;
      color: #00f5c8;
      font-size: 12px;
      font-weight: 900;
    }

    .billing-info {
      min-height: 58px;
      display: grid;
      grid-template-columns: 42px minmax(0, 1fr);
      gap: 12px;
      align-items: center;
      padding: 10px 12px;
      border: 1px solid rgba(0, 195, 255, 0.14);
      border-radius: 8px;
      background: rgba(3, 10, 28, 0.56);
    }

    .billing-info > .material-symbols-rounded,
    .current-plan > .material-symbols-rounded,
    .trust-copy > .material-symbols-rounded {
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      border-radius: 8px;
      color: #b8a8ff;
      background: rgba(124, 58, 237, 0.2);
    }

    .billing-info strong,
    .billing-info small,
    .current-plan strong,
    .current-plan small {
      display: block;
    }

    .billing-info strong {
      font-size: 13px;
      text-transform: uppercase;
    }

    .billing-info small,
    .current-plan small {
      margin-top: 3px;
      color: #b8c5e8;
      font-size: 12px;
    }

    .guarantee > .material-symbols-rounded {
      color: #00f5c8;
      background: rgba(0, 214, 180, 0.16);
    }

    .current-plan {
      display: grid;
      grid-template-columns: 48px auto minmax(0, 1fr);
      align-items: center;
      gap: 14px;
      padding: 14px 18px;
    }

    .current-plan p {
      justify-self: end;
      overflow: hidden;
      max-width: 520px;
      color: #b8c5e8;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .plans-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 20px;
      padding: 4px 0;
    }

    .plan-card {
      position: relative;
      min-height: 590px;
      display: flex;
      flex-direction: column;
      padding: 24px;
      border: 1px solid color-mix(in srgb, var(--accent) 70%, transparent);
      border-radius: 8px;
      background:
        linear-gradient(160deg, rgba(4, 12, 30, 0.94), rgba(2, 6, 18, 0.96)),
        linear-gradient(180deg, color-mix(in srgb, var(--accent) 13%, transparent), transparent 38%);
      box-shadow: inset 0 0 40px color-mix(in srgb, var(--accent) 10%, transparent), 0 24px 70px rgba(0, 0, 0, 0.38);
    }

    .plan-card.featured {
      transform: translateY(-10px);
      box-shadow: 0 0 0 1px rgba(124, 58, 237, 0.38), 0 0 42px rgba(124, 58, 237, 0.28), 0 30px 82px rgba(0, 0, 0, 0.44);
    }

    .popular-badge {
      position: absolute;
      top: -15px;
      left: 50%;
      transform: translateX(-50%);
      min-width: 188px;
      min-height: 32px;
      display: grid;
      place-items: center;
      padding: 0 18px;
      border: 1px solid rgba(168, 85, 247, 0.75);
      border-radius: 8px;
      color: #fff;
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      background: linear-gradient(135deg, #5f2df2, #8b5cf6);
      box-shadow: 0 0 22px rgba(139, 92, 246, 0.62);
    }

    .plan-title {
      display: grid;
      grid-template-columns: 82px minmax(0, 1fr);
      gap: 16px;
      align-items: center;
      min-height: 96px;
    }

    .plan-icon {
      width: 78px;
      height: 78px;
      display: grid;
      place-items: center;
      border: 1px solid color-mix(in srgb, var(--accent) 70%, transparent);
      border-radius: 50%;
      color: var(--accent);
      font-size: 42px;
      background: color-mix(in srgb, var(--accent) 13%, rgba(2, 10, 28, 0.8));
      box-shadow: 0 0 26px color-mix(in srgb, var(--accent) 36%, transparent), inset 0 0 28px color-mix(in srgb, var(--accent) 15%, transparent);
    }

    .plan-title h2 {
      color: var(--accent);
      font-size: 21px;
      text-transform: uppercase;
    }

    .plan-title p {
      margin-top: 7px;
      color: #c5cce7;
      font-size: 13px;
      line-height: 1.45;
    }

    .price-block {
      position: relative;
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: end;
      gap: 7px;
      margin: 26px 0 22px;
      padding-bottom: 22px;
      border-bottom: 1px solid rgba(0, 195, 255, 0.16);
    }

    .price-block strong {
      color: #fff;
      font-size: clamp(32px, 3vw, 38px);
      line-height: 1;
    }

    .price-block > span {
      color: #dbe7ff;
      font-size: 18px;
      padding-bottom: 3px;
    }

    .price-block small {
      grid-column: 1 / -1;
      color: #9ba8d0;
      font-size: 14px;
    }

    .price-block em {
      position: absolute;
      right: 0;
      bottom: 18px;
      padding: 4px 10px;
      border-radius: 8px;
      color: #00f5c8;
      font-style: normal;
      font-weight: 900;
      background: color-mix(in srgb, var(--accent) 24%, rgba(2, 10, 28, 0.9));
    }

    .feature-list {
      display: grid;
      gap: 11px;
      margin: 0 0 24px;
      padding: 0;
      list-style: none;
    }

    .feature-list li {
      display: grid;
      grid-template-columns: 22px minmax(0, 1fr);
      gap: 10px;
      align-items: center;
      color: #eef3ff;
      font-size: 14px;
      line-height: 1.35;
    }

    .feature-list .material-symbols-rounded {
      width: 20px;
      height: 20px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #001a15;
      font-size: 16px;
      background: var(--accent);
    }

    .feature-list li.disabled {
      color: rgba(184, 197, 232, 0.5);
    }

    .feature-list li.disabled .material-symbols-rounded {
      color: #8e99bc;
      background: rgba(148, 163, 184, 0.12);
    }

    .plan-button,
    .confirm-payment,
    .admin-row button {
      min-height: 52px;
      border: 1px solid color-mix(in srgb, var(--accent, #22e6ff) 72%, transparent);
      border-radius: 8px;
      color: #fff;
      font-weight: 900;
      background: linear-gradient(135deg, color-mix(in srgb, var(--accent, #22e6ff) 30%, #040c1e), rgba(11, 18, 45, 0.92));
      box-shadow: 0 0 24px color-mix(in srgb, var(--accent, #22e6ff) 24%, transparent);
    }

    .plan-button {
      margin-top: auto;
      color: var(--accent);
    }

    .plan-button.current {
      color: #27e29b;
      opacity: 0.75;
    }

    .bank-strip {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 18px;
      align-items: center;
      padding: 18px;
    }

    .trust-copy {
      display: grid;
      grid-template-columns: 58px minmax(0, 1fr);
      gap: 14px;
      align-items: center;
    }

    .trust-copy > .material-symbols-rounded {
      width: 58px;
      height: 58px;
      color: #22e6ff;
      font-size: 34px;
    }

    .trust-copy h2 {
      color: #00f5c8;
      font-size: 18px;
    }

    .trust-copy p {
      margin-top: 5px;
      color: #b8c5e8;
      line-height: 1.45;
    }

    .bank-categories {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .bank-categories div {
      min-height: 64px;
      display: grid;
      align-content: center;
      gap: 4px;
      padding: 12px;
      border: 1px solid rgba(124, 58, 237, 0.24);
      border-radius: 8px;
      background: rgba(3, 10, 28, 0.58);
    }

    .bank-categories strong,
    .bank-categories span {
      display: block;
    }

    .bank-categories strong {
      font-size: 12px;
      text-transform: uppercase;
    }

    .bank-categories span {
      color: #b8c5e8;
      font-size: 13px;
    }

    .admin-pricing {
      padding: 18px;
    }

    .admin-pricing header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }

    .admin-pricing small {
      color: #22e6ff;
      font-weight: 900;
      text-transform: uppercase;
    }

    .admin-grid {
      display: grid;
      gap: 10px;
    }

    .admin-row {
      display: grid;
      grid-template-columns: 120px 130px 130px minmax(180px, 1fr) 110px;
      gap: 10px;
      align-items: end;
      padding: 12px;
      border: 1px solid rgba(0, 195, 255, 0.16);
      border-radius: 8px;
      background: rgba(3, 10, 28, 0.58);
    }

    .admin-row label,
    .bank-select {
      display: grid;
      gap: 6px;
      color: #b8c5e8;
      font-size: 12px;
      font-weight: 800;
    }

    .admin-row input,
    .bank-select select {
      width: 100%;
      min-height: 42px;
      border: 1px solid rgba(0, 195, 255, 0.2);
      border-radius: 8px;
      padding: 0 12px;
      color: #f8fbff;
      background: rgba(2, 10, 28, 0.78);
      outline: 0;
    }

    .checkout-layer {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: grid;
      place-items: center;
      padding: 20px;
      background: rgba(0, 0, 0, 0.72);
      backdrop-filter: blur(14px);
    }

    .checkout-modal {
      width: min(560px, 100%);
      display: grid;
      gap: 16px;
      padding: 20px;
      border: 1px solid rgba(0, 195, 255, 0.24);
      border-radius: 8px;
      color: #f8fbff;
      background:
        linear-gradient(145deg, rgba(4, 12, 30, 0.98), rgba(2, 6, 18, 0.98)),
        linear-gradient(90deg, rgba(0, 195, 255, 0.12), transparent 50%, rgba(124, 58, 237, 0.12));
      box-shadow: 0 28px 92px rgba(0, 0, 0, 0.58);
    }

    .checkout-modal header {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 12px;
    }

    .checkout-modal header small {
      color: #22e6ff;
      text-transform: uppercase;
      font-weight: 900;
    }

    .checkout-modal header button {
      width: 40px;
      min-height: 40px;
      border: 1px solid rgba(0, 195, 255, 0.22);
      border-radius: 8px;
      color: #d9e2ff;
      background: rgba(3, 10, 28, 0.7);
    }

    .checkout-total {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px;
      border: 1px solid rgba(0, 214, 180, 0.24);
      border-radius: 8px;
      background: rgba(0, 214, 180, 0.08);
    }

    .checkout-total span {
      color: #b8c5e8;
      font-weight: 800;
    }

    .checkout-total strong {
      color: #00f5c8;
      font-size: 28px;
    }

    .checkout-banks {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      max-height: 190px;
      overflow: auto;
    }

    .checkout-banks button {
      min-height: 48px;
      display: grid;
      grid-template-columns: 14px minmax(0, 1fr);
      gap: 8px;
      align-items: center;
      border: 1px solid rgba(0, 195, 255, 0.14);
      border-radius: 8px;
      color: #d9e2ff;
      background: rgba(3, 10, 28, 0.62);
    }

    .checkout-banks button.active {
      border-color: #00f5c8;
      color: #fff;
      box-shadow: 0 0 18px rgba(0, 245, 200, 0.16);
    }

    .checkout-banks i {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .checkout-banks span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: left;
    }

    .payment-result {
      display: grid;
      grid-template-columns: 42px minmax(0, 1fr);
      gap: 12px;
      align-items: center;
      padding: 12px;
      border: 1px solid rgba(39, 226, 155, 0.24);
      border-radius: 8px;
      background: rgba(39, 226, 155, 0.08);
    }

    .payment-result .material-symbols-rounded {
      color: #27e29b;
      font-size: 34px;
    }

    .payment-result small {
      display: block;
      margin-top: 3px;
      color: #b8c5e8;
    }

    .confirm-payment {
      width: 100%;
      color: #06110e;
      background: linear-gradient(135deg, #00d6b4, #22e6ff);
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.62;
    }

    @media (max-width: 1180px) {
      .plans-grid,
      .billing-band,
      .bank-strip {
        grid-template-columns: 1fr;
      }

      .plan-card.featured {
        transform: none;
      }

      .admin-row {
        grid-template-columns: 1fr 1fr;
      }

      .admin-row strong,
      .admin-row .wide,
      .admin-row button {
        grid-column: 1 / -1;
      }
    }

    @media (max-width: 760px) {
      .subscriptions-page {
        padding: 12px;
      }

      .subscriptions-hero,
      .current-plan {
        align-items: start;
        grid-template-columns: 1fr;
        flex-direction: column;
      }

      .hero-status,
      .billing-toggle,
      .billing-toggle button,
      .billing-toggle span {
        width: 100%;
      }

      .billing-toggle {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }

      .billing-toggle span {
        grid-column: 1 / -1;
        padding: 8px;
        text-align: center;
      }

      .plans-grid,
      .checkout-banks,
      .bank-categories,
      .admin-row {
        grid-template-columns: 1fr;
      }

      .plan-card {
        min-height: auto;
      }

      .current-plan p {
        justify-self: start;
        max-width: 100%;
      }
    }
  `]
})
export class SubscriptionComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);
  private api = inject(ApiService);

  currentPlan: any = null;
  availablePlans: Plan[] = [];
  bankInstitutions: BankInstitution[] = [];
  billingCycle: 'MONTHLY' | 'ANNUAL' = 'ANNUAL';
  paymentPlan: Plan | null = null;
  selectedInstitutionId = '';
  checkingOut = false;
  checkoutResult: PlanCheckoutResponse | null = null;
  activatingFree = false;

  ngOnInit() {
    this.loadData();
    this.loadBanks();
  }

  loadData() {
    this.subscriptionService.getMyPlan().subscribe({
      next: data => this.currentPlan = data
    });

    this.subscriptionService.getAvailablePlans().subscribe({
      next: plans => {
        this.availablePlans = plans.map(plan => ({
          ...plan,
          features: plan.features || [],
          unavailableFeatures: plan.unavailableFeatures || [],
          accentColor: plan.accentColor || '#22e6ff'
        }));
      }
    });
  }

  loadBanks() {
    this.api.getBankInstitutions().subscribe({
      next: banks => {
        this.bankInstitutions = banks.filter(bank => bank.paymentEnabled);
        this.selectedInstitutionId = this.bankInstitutions.find(bank => bank.id === 'mercado-pago')?.id
          || this.bankInstitutions.find(bank => bank.id === 'nubank')?.id
          || this.bankInstitutions[0]?.id
          || '';
      }
    });
  }

  priceFor(plan: Plan): number {
    return this.billingCycle === 'ANNUAL' ? Number(plan.annualPrice || 0) : Number(plan.monthlyPrice || 0);
  }

  annualTotal(plan: Plan): number {
    return Number(plan.monthlyPrice || 0) * 12;
  }

  monthlyEquivalent(plan: Plan): number {
    return Number(plan.annualPrice || 0) / 12;
  }

  planLabel(plan: Plan): string {
    if (plan.name === 'FREE') return 'Free';
    if (plan.name === 'ENTERPRISE') return 'Ultimate';
    return plan.displayName;
  }

  planIcon(plan: Plan): string {
    if (plan.name === 'FREE') return 'deployed_code';
    if (plan.name === 'ENTERPRISE') return 'crown';
    return 'auto_awesome';
  }

  openCheckout(plan: Plan) {
    this.paymentPlan = plan;
    this.checkoutResult = null;
  }

  selectPlan(plan: Plan) {
    if (this.priceFor(plan) <= 0) {
      this.activateFree(plan);
      return;
    }

    this.openCheckout(plan);
  }

  actionLabel(plan: Plan): string {
    if (this.priceFor(plan) <= 0) {
      return this.activatingFree ? 'Ativando...' : 'Ativar Free';
    }

    return `Escolher ${plan.displayName}`;
  }

  activateFree(plan: Plan) {
    if (this.activatingFree) {
      return;
    }

    this.activatingFree = true;
    this.subscriptionService.upgradePlan(plan.name).subscribe({
      next: () => {
        this.activatingFree = false;
        this.loadData();
      },
      error: () => this.activatingFree = false
    });
  }

  closeCheckout() {
    this.paymentPlan = null;
    this.checkoutResult = null;
    this.checkingOut = false;
  }

  confirmCheckout() {
    if (!this.paymentPlan || !this.selectedInstitutionId) {
      return;
    }

    this.checkingOut = true;
    this.subscriptionService.checkoutPlan(this.paymentPlan.name, this.billingCycle, this.selectedInstitutionId).subscribe({
      next: result => {
        this.checkoutResult = result;
        this.checkingOut = false;
        this.loadData();
      },
      error: () => this.checkingOut = false
    });
  }

  bankCategories() {
    return [
      { key: 'BR_DIGITAL', label: 'Digitais BR', count: this.bankInstitutions.filter(bank => bank.category === 'BR_DIGITAL').length },
      { key: 'INVESTMENT', label: 'Investimentos', count: this.bankInstitutions.filter(bank => bank.category === 'INVESTMENT').length },
      { key: 'INTERNATIONAL', label: 'Internacionais', count: this.bankInstitutions.filter(bank => bank.category === 'INTERNATIONAL').length }
    ];
  }

  visibleBanks(): BankInstitution[] {
    return this.bankInstitutions.slice(0, 12);
  }

  categoryLabel(category: string): string {
    if (category === 'INVESTMENT') return 'Investimento';
    if (category === 'INTERNATIONAL') return 'Internacional';
    return 'Digital';
  }
}
