import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../shared/components/card-input.component';
import { CardComponent } from '../../shared/card-input.component';

@Component({
  selector: 'app-calculators',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  template: `
    <div class="calculators-page">
      <h1>Calculadoras</h1>

      
      <div class="calculator-tabs">
        <button [class.active]="activeCalc === 'compound'" (click)="activeCalc = 'compound'">Juros Compostos</button>
        <button [class.active]="activeCalc === 'reserve'" (click)="activeCalc = 'reserve'">Reserva Emergencia</button>
        <button [class.active]="activeCalc === 'dividend'" (click)="activeCalc = 'dividend'">Dividendos</button>
        <button [class.active]="activeCalc === 'goal'" (click)="activeCalc = 'goal'">Meta Patrimonial</button>
      </div>

      @if (activeCalc === 'compound') {
        <app-card>
          <h3>Calculadora de Juros Compostos</h3>
          <p class="subtitle">Calcule o crescimento do seu investimento ao longo do tempo</p>

          
          <div class="form-group">
            <label>Valor Inicial (R$)</label>
            <input type="number" [(ngModel)]="compoundInitial" />
          </div>
          <div class="form-group">
            <label>Investimento Mensal (R$)</label>
            <input type="number" [(ngModel)]="compoundMonthly" />
          </div>
          <div class="form-group">
            <label>Taxa de Juros Anual (%)</label>
            <input type="number" [(ngModel)]="compoundRate" />
          </div>
          <div class="form-group">
            <label>Período (anos)</label>
            <input type="number" [(ngModel)]="compoundYears" />
          </div>

          <div class="result">
            <span class="label">Valor Final</span>
            <span class="value">{{ compoundResult | currency:'BRL' }}</span>
          </div>
        </app-card>
      }

      @if (activeCalc === 'reserve') {
        <app-card>
          <h3>Reserva de Emergencia</h3>
          <p class="subtitle">Calcule quanto você precisa guardar</p>

          
          <div class="form-group">
            <label>Gastos Mensais (R$)</label>
            <input type="number" [(ngModel)]="reserveMonthly" />
          </div>
          <div class="form-group">
            <label>Meses de Reserva</label>
            <input type="number" [(ngModel)]="reserveMonths" />
          </div>
          <div class="form-group">
            <label>Taxa de Juros Anual (%)</label>
            <input type="number" [(ngModel)]="reserveRate" />
          </div>

          <div class="result">
            <span class="label">Meta da Reserva</span>
            <span class="value">{{ reserveResult | currency:'BRL' }}</span>
          </div>
        </app-card>
      }

      @if (activeCalc === 'dividend') {
        <app-card>
          <h3>Simulador de Dividendos</h3>
          <p class="subtitle">Calcule a renda passiva esperada</p>

          
          <div class="form-group">
            <label>Patrimônio (R$)</label>
            <input type="number" [(ngModel)]="dividendPrincipal" />
          </div>
          <div class="form-group">
            <label>Dividend Yield Anual (%)</label>
            <input type="number" [(ngModel)]="dividendYield" />
          </div>

          <div class="result">
            <span class="label">Renda Mensal</span>
            <span class="value">{{ dividendResult | currency:'BRL' }}</span>
          </div>
        </app-card>
      }

      @if (activeCalc === 'goal') {
        <app-card>
          <h3>Meta Patrimonial</h3>
          <p class="subtitle">Calcule quanto investir por mês para atingir sua meta</p>

          
          <div class="form-group">
            <label>Meta (R$)</label>
            <input type="number" [(ngModel)]="goalTarget" />
          </div>
          <div class="form-group">
            <label>Valor Atual (R$)</label>
            <input type="number" [(ngModel)]="goalCurrent" />
          </div>
          <div class="form-group">
            <label>Taxa de Juros Anual (%)</label>
            <input type="number" [(ngModel)]="goalRate" />
          </div>
          <div class="form-group">
            <label>Prazo (meses)</label>
            <input type="number" [(ngModel)]="goalMonths" />
          </div>

          <div class="result">
            <span class="label">Investimento Mensal Necessário</span>
            <span class="value">{{ goalResult | currency:'BRL' }}</span>
          </div>
        </app-card>
      }
    </div>
  `,
  styles: [`
    .calculators-page { padding: var(--space-lg); max-width: 600px; margin: 0 auto; }
    h1 { margin-bottom: var(--space-lg); }
    .calculator-tabs { display: flex; gap: var(--space-sm); margin-bottom: var(--space-lg); flex-wrap: wrap; }
    .calculator-tabs button {
      padding: var(--space-sm) var(--space-md);
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text);
      cursor: pointer;
    }
    .calculator-tabs button.active { background: var(--primary); border-color: var(--primary); }
    app-card h3 { margin: 0 0 var(--space-xs); }
    .subtitle { color: var(--text-secondary); font-size: var(--font-sm); margin-bottom: var(--space-lg); }
    .form-group { margin-bottom: var(--space-md); }
    .form-group label { display: block; font-size: var(--font-sm); color: var(--text-secondary); margin-bottom: var(--space-xs); }
    .form-group input { width: 100%; padding: var(--space-md); background: var(--background-alt); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text); }
    .result { background: var(--card-hover); padding: var(--space-lg); border-radius: var(--radius-md); text-align: center; margin-top: var(--space-lg); }
    .result .label { display: block; font-size: var(--font-sm); color: var(--text-secondary); margin-bottom: var(--space-xs); }
    .result .value { font-size: var(--font-2xl); font-weight: bold; color: var(--primary); }
  `]
})
export class CalculatorsComponent {
  activeCalc: 'compound' | 'reserve' | 'dividend' | 'goal' = 'compound';
  compoundInitial = 1000;
  compoundMonthly = 500;
  compoundRate = 10;
  compoundYears = 10;
  reserveMonthly = 5000;
  reserveMonths = 6;
  reserveRate = 8;
  dividendPrincipal = 100000;
  dividendYield = 6;
  goalTarget = 1000000;
  goalCurrent = 100000;
  goalRate = 12;
  goalMonths = 60;

  get compoundResult(): number {
    const r = this.compoundRate / 100 / 12;
    const n = this.compoundYears * 12;
    const fv = this.compoundInitial * Math.pow(1 + r, n);
    const pmt = this.compoundMonthly * ((Math.pow(1 + r, n) - 1) / r);
    return fv + pmt;
  }

  get reserveResult(): number {
    return this.reserveMonthly * this.reserveMonths;
  }

  get dividendResult(): number {
    return (this.dividendPrincipal * this.dividendYield / 100) / 12;
  }

  get goalResult(): number {
    const r = this.goalRate / 100 / 12;
    const target = this.goalTarget - this.goalCurrent * Math.pow(1 + r, this.goalMonths);
    return target / ((Math.pow(1 + r, this.goalMonths) - 1) / r);
  }
}
}
