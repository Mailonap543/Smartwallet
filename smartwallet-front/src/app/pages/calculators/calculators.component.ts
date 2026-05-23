import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type CalculatorTab = 'compound' | 'reserve' | 'dividend' | 'goal' | 'risk';

@Component({
  selector: 'app-calculators',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="calculators-page">
      <header class="calc-hero">
        <div>
          <span class="eyebrow">Planejamento</span>
          <h1>Calculadoras</h1>
          <p>Simule cenarios, compare metas e descubra seu perfil de risco.</p>
        </div>
      </header>

      <nav class="calculator-tabs" aria-label="Calculadoras">
        @for (tab of tabs; track tab.id) {
          <button [class.active]="activeCalc === tab.id" (click)="activeCalc = tab.id">
            <span class="material-symbols-rounded" aria-hidden="true">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        }
      </nav>

      <section class="calc-shell">
        @if (activeCalc === 'compound') {
          <article class="calc-card">
            <div class="card-heading">
              <span class="material-symbols-rounded" aria-hidden="true">query_stats</span>
              <div>
                <h2>Juros compostos</h2>
                <p>Veja quanto seu dinheiro pode crescer ao longo do tempo.</p>
              </div>
            </div>
            <div class="form-grid">
              <label>Valor inicial <input type="number" [(ngModel)]="compoundInitial" /></label>
              <label>Investimento mensal <input type="number" [(ngModel)]="compoundMonthly" /></label>
              <label>Juros anual (%) <input type="number" [(ngModel)]="compoundRate" /></label>
              <label>Periodo (anos) <input type="number" [(ngModel)]="compoundYears" /></label>
            </div>
            <button class="primary-action" type="button" (click)="calculateCompound()">Calcular juros compostos</button>
            <div class="result-card">
              <span>Valor final estimado</span>
              <strong>{{ compoundResult | currency:'BRL' }}</strong>
            </div>
          </article>
        }

        @if (activeCalc === 'reserve') {
          <article class="calc-card">
            <div class="card-heading">
              <span class="material-symbols-rounded" aria-hidden="true">savings</span>
              <div>
                <h2>Reserva de emergencia</h2>
                <p>Calcule quanto guardar para atravessar imprevistos.</p>
              </div>
            </div>
            <div class="form-grid">
              <label>Gastos mensais <input type="number" [(ngModel)]="reserveMonthly" /></label>
              <label>Meses de reserva <input type="number" [(ngModel)]="reserveMonths" /></label>
              <label>Juros anual (%) <input type="number" [(ngModel)]="reserveRate" /></label>
            </div>
            <button class="primary-action" type="button" (click)="calculateReserve()">Calcular reserva</button>
            <div class="result-card">
              <span>Meta da reserva</span>
              <strong>{{ reserveResult | currency:'BRL' }}</strong>
            </div>
          </article>
        }

        @if (activeCalc === 'dividend') {
          <article class="calc-card">
            <div class="card-heading">
              <span class="material-symbols-rounded" aria-hidden="true">redeem</span>
              <div>
                <h2>Dividendos</h2>
                <p>Simule a renda passiva mensal pelo dividend yield.</p>
              </div>
            </div>
            <div class="form-grid">
              <label>Patrimonio <input type="number" [(ngModel)]="dividendPrincipal" /></label>
              <label>Dividend yield anual (%) <input type="number" [(ngModel)]="dividendYield" /></label>
            </div>
            <button class="primary-action" type="button" (click)="calculateDividend()">Calcular dividendos</button>
            <div class="result-card">
              <span>Renda mensal estimada</span>
              <strong>{{ dividendResult | currency:'BRL' }}</strong>
            </div>
          </article>
        }

        @if (activeCalc === 'goal') {
          <article class="calc-card">
            <div class="card-heading">
              <span class="material-symbols-rounded" aria-hidden="true">flag</span>
              <div>
                <h2>Meta patrimonial</h2>
                <p>Descubra o aporte mensal necessario para chegar ao objetivo.</p>
              </div>
            </div>
            <div class="form-grid">
              <label>Meta <input type="number" [(ngModel)]="goalTarget" /></label>
              <label>Valor atual <input type="number" [(ngModel)]="goalCurrent" /></label>
              <label>Juros anual (%) <input type="number" [(ngModel)]="goalRate" /></label>
              <label>Prazo (meses) <input type="number" [(ngModel)]="goalMonths" /></label>
            </div>
            <button class="primary-action" type="button" (click)="calculateGoal()">Calcular meta</button>
            <div class="result-card">
              <span>Aporte mensal necessario</span>
              <strong>{{ goalResult | currency:'BRL' }}</strong>
            </div>
          </article>
        }

        @if (activeCalc === 'risk') {
          <article class="calc-card risk-card">
            <div class="card-heading">
              <span class="material-symbols-rounded" aria-hidden="true">psychology</span>
              <div>
                <h2>Pesquisa de perfil de risco</h2>
                <p>Responda e descubra se seu perfil e conservador, moderado ou arrojado.</p>
              </div>
            </div>

            <div class="risk-questions">
              @for (question of riskQuestions; track question.id) {
                <fieldset>
                  <legend>{{ question.label }}</legend>
                  <div class="option-grid">
                    @for (option of question.options; track option.value) {
                      <label [class.selected]="riskAnswers[question.id] === option.value">
                        <input type="radio" [name]="question.id" [value]="option.value" [(ngModel)]="riskAnswers[question.id]" />
                        {{ option.label }}
                      </label>
                    }
                  </div>
                </fieldset>
              }
            </div>

            <button class="primary-action" type="button" (click)="calculateRiskProfile()">Definir perfil de risco</button>
            <div class="result-card risk-result">
              <span>Perfil sugerido</span>
              <strong>{{ riskProfile }}</strong>
              <em>Pontuacao: {{ riskScore || '-' }} / 24</em>
              <small>{{ riskProfileDescription }}</small>
            </div>
          </article>
        }
      </section>
    </div>
  `,
  styles: [`
    .calculators-page {
      min-height: 100%;
      padding: 28px;
      color: #0f172a;
    }

    .calc-hero,
    .calc-card {
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 26px;
      background: rgba(255, 255, 255, 0.88);
      box-shadow: 0 22px 60px rgba(15, 23, 42, 0.09);
    }

    .calc-hero {
      padding: 24px;
      background:
        radial-gradient(circle at 12% 0%, rgba(16, 185, 129, 0.18), transparent 34%),
        linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(239, 253, 246, 0.86));
    }

    .eyebrow {
      display: block;
      margin-bottom: 8px;
      color: #07814d;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    h1, h2, p {
      margin: 0;
    }

    h1 {
      font-size: 38px;
      line-height: 1;
    }

    .calc-hero p,
    .card-heading p,
    .risk-result small {
      margin-top: 8px;
      color: #64748b;
      font-size: 14px;
    }

    .risk-result em {
      color: rgba(255, 255, 255, 0.78);
      font-size: 13px;
      font-style: normal;
      font-weight: 800;
    }

    .calculator-tabs {
      display: flex;
      gap: 8px;
      margin: 18px 0;
      overflow-x: auto;
      padding: 6px;
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.76);
      box-shadow: 0 16px 38px rgba(15, 23, 42, 0.06);
    }

    .calculator-tabs button {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 0 15px;
      border: 0;
      border-radius: 13px;
      color: #64748b;
      background: transparent;
      font-weight: 850;
      white-space: nowrap;
      cursor: pointer;
    }

    .calculator-tabs button.active {
      color: #fff;
      background: linear-gradient(135deg, #16a467, #0f8b59);
      box-shadow: 0 12px 26px rgba(16, 185, 129, 0.18);
    }

    .calc-card {
      padding: 24px;
    }

    .card-heading {
      display: flex;
      gap: 14px;
      align-items: center;
      margin-bottom: 20px;
    }

    .card-heading > .material-symbols-rounded {
      width: 52px;
      height: 52px;
      display: grid;
      place-items: center;
      border-radius: 18px;
      color: #0f8b59;
      background: rgba(16, 185, 129, 0.12);
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }

    label {
      display: grid;
      gap: 8px;
      color: #475569;
      font-size: 13px;
      font-weight: 800;
    }

    input {
      min-height: 48px;
      border: 1px solid rgba(148, 163, 184, 0.28);
      border-radius: 14px;
      padding: 0 14px;
      color: #0f172a;
      background: rgba(248, 250, 252, 0.82);
      outline: 0;
    }

    input:focus {
      border-color: rgba(16, 185, 129, 0.62);
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12);
    }

    .primary-action {
      min-height: 48px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-top: 18px;
      padding: 0 18px;
      border: 0;
      border-radius: 15px;
      color: #fff;
      font-weight: 900;
      cursor: pointer;
      background: linear-gradient(135deg, #6729ff, #3187ff 48%, #27e29b);
      box-shadow: 0 18px 42px rgba(16, 185, 129, 0.22);
    }

    .result-card {
      display: grid;
      gap: 6px;
      margin-top: 18px;
      padding: 20px;
      border-radius: 20px;
      color: #fff;
      background:
        radial-gradient(circle at 90% 12%, rgba(39, 226, 155, 0.28), transparent 32%),
        linear-gradient(145deg, #0f172a, #123c37);
    }

    .result-card span {
      color: rgba(255, 255, 255, 0.72);
      font-size: 13px;
      font-weight: 800;
    }

    .result-card strong {
      font-size: 28px;
    }

    .risk-questions {
      display: grid;
      gap: 14px;
    }

    fieldset {
      margin: 0;
      padding: 16px;
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 18px;
    }

    legend {
      padding: 0 8px;
      color: #0f172a;
      font-weight: 900;
    }

    .option-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 10px;
    }

    .option-grid label {
      min-height: 46px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(148, 163, 184, 0.22);
      border-radius: 14px;
      color: #475569;
      background: rgba(248, 250, 252, 0.76);
      cursor: pointer;
    }

    .option-grid input {
      display: none;
    }

    .option-grid label.selected {
      color: #fff;
      border-color: transparent;
      background: linear-gradient(135deg, #16a467, #0f8b59);
    }

    @media (prefers-color-scheme: dark) {
      .calculators-page {
        color: #f8fafc;
      }

      .calc-hero,
      .calc-card,
      .calculator-tabs {
        border-color: rgba(124, 58, 237, 0.22);
        background:
          radial-gradient(circle at 12% 0%, rgba(124, 58, 237, 0.2), transparent 36%),
          rgba(13, 15, 40, 0.86);
      }

      .calc-hero p,
      .card-heading p,
      label,
      .risk-result small {
        color: #b8c1dd;
      }

      input,
      .option-grid label {
        color: #f8fafc;
        border-color: rgba(124, 58, 237, 0.22);
        background: rgba(10, 14, 38, 0.72);
      }

      legend {
        color: #f8fafc;
      }
    }

    @media (max-width: 760px) {
      .calculators-page {
        padding: 18px;
      }

      .form-grid,
      .option-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CalculatorsComponent {
  private readonly riskStorageKey = 'smartwallet-risk-profile';
  activeCalc: CalculatorTab = 'compound';

  tabs = [
    { id: 'compound' as CalculatorTab, label: 'Juros', icon: 'query_stats' },
    { id: 'reserve' as CalculatorTab, label: 'Reserva', icon: 'savings' },
    { id: 'dividend' as CalculatorTab, label: 'Dividendos', icon: 'redeem' },
    { id: 'goal' as CalculatorTab, label: 'Meta', icon: 'flag' },
    { id: 'risk' as CalculatorTab, label: 'Perfil de risco', icon: 'psychology' }
  ];

  compoundInitial = 1000;
  compoundMonthly = 500;
  compoundRate = 10;
  compoundYears = 10;
  compoundResult = 0;

  reserveMonthly = 5000;
  reserveMonths = 6;
  reserveRate = 8;
  reserveResult = 0;

  dividendPrincipal = 100000;
  dividendYield = 6;
  dividendResult = 0;

  goalTarget = 1000000;
  goalCurrent = 100000;
  goalRate = 12;
  goalMonths = 60;
  goalResult = 0;

  riskProfile = 'Nao definido';
  riskProfileDescription = 'Responda a pesquisa para receber uma sugestao.';
  riskScore = 0;
  riskAnswers: Record<string, number> = {
    horizon: 2,
    reaction: 2,
    objective: 2,
    experience: 2,
    incomeStability: 2,
    liquidity: 2,
    concentration: 2,
    knowledge: 2
  };

  riskQuestions = [
    {
      id: 'horizon',
      label: 'Por quanto tempo pretende investir?',
      options: [
        { label: 'Ate 1 ano', value: 1 },
        { label: '1 a 5 anos', value: 2 },
        { label: 'Mais de 5 anos', value: 3 }
      ]
    },
    {
      id: 'reaction',
      label: 'Como reage a uma queda de 10%?',
      options: [
        { label: 'Vendo tudo', value: 1 },
        { label: 'Aguardo', value: 2 },
        { label: 'Compro mais', value: 3 }
      ]
    },
    {
      id: 'objective',
      label: 'Qual seu objetivo principal?',
      options: [
        { label: 'Preservar', value: 1 },
        { label: 'Equilibrar', value: 2 },
        { label: 'Crescer', value: 3 }
      ]
    },
    {
      id: 'experience',
      label: 'Qual sua experiencia com renda variavel?',
      options: [
        { label: 'Iniciante', value: 1 },
        { label: 'Intermediaria', value: 2 },
        { label: 'Avancada', value: 3 }
      ]
    },
    {
      id: 'incomeStability',
      label: 'Como esta sua estabilidade de renda hoje?',
      options: [
        { label: 'Instavel', value: 1 },
        { label: 'Regular', value: 2 },
        { label: 'Estavel', value: 3 }
      ]
    },
    {
      id: 'liquidity',
      label: 'Se precisar do dinheiro, quando quer resgatar?',
      options: [
        { label: 'Imediato', value: 1 },
        { label: 'Alguns meses', value: 2 },
        { label: 'Posso esperar', value: 3 }
      ]
    },
    {
      id: 'concentration',
      label: 'Quanto aceita concentrar em acoes, FIIs ou ETFs?',
      options: [
        { label: 'Pouco', value: 1 },
        { label: 'Medio', value: 2 },
        { label: 'Bastante', value: 3 }
      ]
    },
    {
      id: 'knowledge',
      label: 'Com que frequencia acompanha o mercado?',
      options: [
        { label: 'Quase nunca', value: 1 },
        { label: 'Semanalmente', value: 2 },
        { label: 'Todo dia', value: 3 }
      ]
    }
  ];

  constructor() {
    this.calculateCompound();
    this.calculateReserve();
    this.calculateDividend();
    this.calculateGoal();
    this.loadRiskProfile();
  }

  calculateCompound(): void {
    const monthlyRate = this.compoundRate / 100 / 12;
    const months = this.compoundYears * 12;
    const initialFutureValue = this.compoundInitial * Math.pow(1 + monthlyRate, months);
    const monthlyFutureValue = monthlyRate === 0
      ? this.compoundMonthly * months
      : this.compoundMonthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    this.compoundResult = initialFutureValue + monthlyFutureValue;
  }

  calculateReserve(): void {
    const baseReserve = this.reserveMonthly * this.reserveMonths;
    const monthlyRate = this.reserveRate / 100 / 12;
    this.reserveResult = baseReserve * (1 + monthlyRate);
  }

  calculateDividend(): void {
    this.dividendResult = (this.dividendPrincipal * this.dividendYield / 100) / 12;
  }

  calculateGoal(): void {
    const monthlyRate = this.goalRate / 100 / 12;
    const adjustedCurrent = this.goalCurrent * Math.pow(1 + monthlyRate, this.goalMonths);
    const targetGap = this.goalTarget - adjustedCurrent;
    if (monthlyRate === 0) {
      this.goalResult = targetGap / this.goalMonths;
      return;
    }
    this.goalResult = targetGap / ((Math.pow(1 + monthlyRate, this.goalMonths) - 1) / monthlyRate);
  }

  calculateRiskProfile(): void {
    const score = Object.values(this.riskAnswers).reduce((sum, value) => sum + Number(value), 0);
    this.riskScore = score;
    if (score <= 13) {
      this.riskProfile = 'Conservador';
      this.riskProfileDescription = 'Prioriza seguranca, liquidez e menor volatilidade. Ideal para uma carteira com mais renda fixa e menos oscilacao.';
    } else if (score <= 19) {
      this.riskProfile = 'Moderado';
      this.riskProfileDescription = 'Busca equilibrio entre estabilidade e crescimento. Pode combinar renda fixa, FIIs, ETFs e acoes com controle de risco.';
    } else {
      this.riskProfile = 'Arrojado';
      this.riskProfileDescription = 'Aceita mais oscilacao em busca de maior retorno. Combina melhor com diversificacao e acompanhamento frequente.';
    }

    localStorage.setItem(this.riskStorageKey, JSON.stringify({
      profile: this.riskProfile,
      description: this.riskProfileDescription,
      score: this.riskScore,
      answers: this.riskAnswers,
      updatedAt: new Date().toISOString()
    }));
  }

  private loadRiskProfile(): void {
    const savedProfile = localStorage.getItem(this.riskStorageKey);
    if (!savedProfile) {
      return;
    }

    try {
      const parsed = JSON.parse(savedProfile) as {
        profile?: string;
        description?: string;
        score?: number;
        answers?: Record<string, number>;
      };
      this.riskProfile = parsed.profile || this.riskProfile;
      this.riskProfileDescription = parsed.description || this.riskProfileDescription;
      this.riskScore = parsed.score || this.riskScore;
      this.riskAnswers = { ...this.riskAnswers, ...(parsed.answers || {}) };
    } catch {
      localStorage.removeItem(this.riskStorageKey);
    }
  }
}
