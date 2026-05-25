import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface DividendEvent {
  symbol: string;
  name: string;
  date: string;
  amount: number;
  type: string;
  status: 'upcoming' | 'paid';
}

interface CalendarDay {
  day: number;
  active?: boolean;
  pay?: boolean;
  highlight?: boolean;
}

@Component({
  selector: 'app-dividends-calendar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="calendar-os">
      <header class="calendar-topbar">
        <div>
          <h1>Calendário</h1>
          <p>Agenda inteligente de dividendos, JCP, datas-com e pagamentos futuros.</p>
        </div>

        <div class="period-switch" aria-label="Período do calendário">
          <button [class.active]="view === 'upcoming'" type="button" (click)="view = 'upcoming'">PRÓXIMOS</button>
          <button [class.active]="view === 'paid'" type="button" (click)="view = 'paid'">HISTÓRICO</button>
        </div>

        <button class="help-button" type="button" routerLink="/market">
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">add</span>
          Adicionar ativo
        </button>
      </header>

      <section class="calendar-command">
        <article class="agenda-card">
          <div class="agenda-head">
            <strong>AGENDA</strong>
            <span class="pulse-line" aria-hidden="true">
              @for (bar of waveformBars; track $index) {
                <i [style.height.px]="bar"></i>
              }
            </span>
          </div>
          <h2>{{ nextEvent?.symbol || 'Carteira' }} em foco</h2>
          <p>{{ nextEvent ? 'Próximo pagamento monitorado pela Smartwallet.' : 'Nenhum pagamento encontrado no período atual.' }}</p>
          <div class="next-payment">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">event_available</span>
            <div>
              <small>Próximo evento</small>
              <strong>{{ nextEvent?.date || '--/--' }}</strong>
            </div>
          </div>
          <button class="primary-action" type="button" routerLink="/market">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">monitoring</span>
            Ver ativos
          </button>
        </article>

        <article class="calendar-hud" aria-label="Calendário holográfico">
          <div class="hud-ring outer"></div>
          <div class="hud-ring middle"></div>
          <div class="calendar-core">
            <div class="month-label">
              <strong>ABRIL</strong>
              <span>2026</span>
            </div>
            <div class="calendar-grid">
              @for (day of calendarDays; track day.day) {
                <span [class.active]="day.active" [class.pay]="day.pay" [class.highlight]="day.highlight">{{ day.day }}</span>
              }
            </div>
          </div>
          <span class="sound-wave left" aria-hidden="true"></span>
          <span class="sound-wave right" aria-hidden="true"></span>
          <div class="calendar-caption">
            <strong>Agenda em tempo real</strong>
            <small>Eventos filtrados por carteira e ativos acompanhados.</small>
          </div>
        </article>

        <aside class="metric-stack">
          <div class="metric-card">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">payments</span>
            <div>
              <small>Proventos estimados</small>
              <strong>{{ totalAmount | currency:'BRL' }}</strong>
              <em>Eventos do período</em>
            </div>
          </div>
          <div class="metric-card">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">event_upcoming</span>
            <div>
              <small>Próximos pagamentos</small>
              <strong>{{ upcomingCount }}</strong>
              <em>Monitorados pela carteira</em>
            </div>
          </div>
          <div class="metric-card">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">account_balance_wallet</span>
            <div>
              <small>Ativos com agenda</small>
              <strong>{{ trackedAssets }}</strong>
              <em>Dividendos e JCP</em>
            </div>
          </div>
        </aside>
      </section>

      <section class="capability-strip">
        <article>
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">paid</span>
          <div>
            <h3>Dividendos</h3>
            <p>Pagamentos em dinheiro organizados por ativo.</p>
          </div>
        </article>
        <article>
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">receipt_long</span>
          <div>
            <h3>JCP</h3>
            <p>Juros sobre capital próprio destacados na agenda.</p>
          </div>
        </article>
        <article>
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">today</span>
          <div>
            <h3>Data-com</h3>
            <p>Base pronta para separar direito ao provento.</p>
          </div>
        </article>
        <article>
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">notifications_active</span>
          <div>
            <h3>Alertas</h3>
            <p>Preparado para WhatsApp quando a IA liberar aviso.</p>
          </div>
        </article>
      </section>

      <section class="content-grid">
        <article class="panel timeline-panel">
          <div class="panel-heading">
            <h2>{{ view === 'upcoming' ? 'Próximos eventos' : 'Histórico de pagamentos' }}</h2>
            <button type="button">{{ filteredEvents.length }} eventos</button>
          </div>

          @if (filteredEvents.length) {
            <div class="event-list">
              @for (event of filteredEvents; track event.symbol + event.date + event.type) {
                <a class="event-row" [routerLink]="['/market/detail', event.symbol]">
                  <div class="date-box">
                    <strong>{{ event.date.split('/')[0] }}</strong>
                    <span>{{ event.date.split('/')[1] }}</span>
                  </div>
                  <div class="event-info">
                    <span class="ticker">{{ event.symbol }}</span>
                    <strong>{{ event.name }}</strong>
                    <small>{{ event.type }} monitorado pela agenda</small>
                  </div>
                  <div class="event-value">
                    <small>Valor por cota</small>
                    <strong>{{ event.amount | number:'1.4-4' }}</strong>
                  </div>
                  <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">chevron_right</span>
                </a>
              }
            </div>
          } @else {
            <div class="empty-state">
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">event_busy</span>
              <h3>Nenhum evento encontrado</h3>
              <p>Quando houver proventos, eles aparecem organizados aqui.</p>
            </div>
          }
        </article>

        <article class="panel insights-panel">
          <div class="panel-heading">
            <h2>Insights da agenda</h2>
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">auto_awesome</span>
          </div>

          <div class="insight-item">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">trending_up</span>
            <div>
              <strong>Fluxo de caixa</strong>
              <small>Proventos concentrados na segunda quinzena do mês.</small>
            </div>
          </div>
          <div class="insight-item">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">donut_large</span>
            <div>
              <strong>Diversificação</strong>
              <small>Inclua FIIs e ações pagadoras para suavizar a renda.</small>
            </div>
          </div>
          <div class="insight-item">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">forum</span>
            <div>
              <strong>WhatsApp futuro</strong>
              <small>Central preparada para avisar antes de pagamento e data-com.</small>
            </div>
          </div>

          <button class="report-button" type="button">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">assignment</span>
            Exportar agenda
          </button>
        </article>
      </section>

      <footer class="system-footer">
        <span>SW // CALENDAR OS V2.0</span>
        <span>EVENTOS <strong>{{ events.length }}</strong></span>
        <span>PRÓXIMO <strong>{{ nextEvent?.symbol || '--' }}</strong></span>
        <span>STATUS <strong>ONLINE</strong></span>
        <span class="system-core"></span>
        <span>CONECTADO</span>
        <span>TEMPO REAL</span>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100%;
    }

    .calendar-os {
      min-height: 100%;
      overflow-x: hidden;
      padding: 14px 14px 10px;
      color: #f8fbff;
      background:
        linear-gradient(rgba(0, 198, 255, 0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 198, 255, 0.035) 1px, transparent 1px),
        radial-gradient(circle at 50% 8%, rgba(0, 153, 255, 0.22), transparent 28%),
        linear-gradient(145deg, #02040d 0%, #050b1c 48%, #02040d 100%);
      background-size: 34px 34px, 34px 34px, auto, auto;
    }

    h1, h2, h3, p {
      margin: 0;
    }

    .calendar-topbar,
    .period-switch,
    .agenda-head,
    .panel-heading,
    .event-row,
    .insight-item,
    .system-footer {
      display: flex;
      align-items: center;
    }

    .calendar-topbar {
      justify-content: space-between;
      gap: 14px;
      min-height: 78px;
      margin-bottom: 8px;
      padding: 14px 20px;
      border: 1px solid rgba(0, 195, 255, 0.18);
      border-radius: 4px 22px 4px 22px;
      background:
        linear-gradient(135deg, rgba(4, 12, 30, 0.84), rgba(2, 5, 16, 0.86)),
        radial-gradient(circle at 60% 0%, rgba(0, 195, 255, 0.16), transparent 40%);
    }

    .calendar-topbar h1 {
      font-size: 28px;
      line-height: 1;
    }

    .calendar-topbar p,
    .agenda-card p,
    .capability-strip p,
    .insight-item small,
    .event-info small,
    .metric-card em {
      color: #b8c5e8;
      line-height: 1.45;
    }

    .calendar-topbar p {
      max-width: 560px;
      margin-top: 7px;
      font-size: 13px;
    }

    .period-switch {
      overflow: hidden;
      border: 1px solid rgba(0, 195, 255, 0.18);
      border-radius: 2px 18px 2px 18px;
      background: rgba(0, 22, 42, 0.72);
    }

    .period-switch button,
    .help-button,
    .primary-action,
    .report-button {
      min-height: 38px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 0;
      color: #9fb0dc;
      background: transparent;
      cursor: pointer;
    }

    .period-switch button {
      padding: 0 13px;
      color: #22e6ff;
      font-weight: 900;
    }

    .period-switch button.active {
      color: #2fffd0;
      background: rgba(39, 226, 155, 0.12);
    }

    .help-button,
    .report-button {
      border: 1px solid rgba(124, 58, 237, 0.42);
      border-radius: 11px;
      padding: 0 16px;
      color: #f8fbff;
      background: rgba(11, 18, 45, 0.78);
    }

    .primary-action {
      width: max-content;
      border-radius: 11px;
      padding: 0 20px;
      color: #fff;
      font-weight: 900;
      background: linear-gradient(135deg, #3b22d5, #6729ff 54%, #1068ff);
      box-shadow: 0 18px 40px rgba(60, 74, 255, 0.26);
    }

    .calendar-command,
    .panel,
    .capability-strip {
      border: 1px solid rgba(0, 195, 255, 0.2);
      background:
        linear-gradient(135deg, rgba(4, 12, 30, 0.88), rgba(2, 6, 18, 0.88)),
        radial-gradient(circle at 50% 0%, rgba(0, 195, 255, 0.15), transparent 38%);
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.36), inset 0 0 38px rgba(0, 149, 255, 0.04);
    }

    .calendar-command {
      display: grid;
      grid-template-columns: minmax(230px, 0.9fr) minmax(340px, 1.35fr) minmax(240px, 0.86fr);
      gap: 14px;
      min-height: 302px;
      padding: 14px;
      border-radius: 6px 22px 6px 22px;
      overflow: hidden;
    }

    .agenda-card {
      min-width: 0;
      align-self: center;
      display: grid;
      gap: 14px;
      padding: 16px;
      border: 1px solid rgba(0, 195, 255, 0.18);
      border-radius: 3px 18px 3px 18px;
      background: rgba(2, 7, 20, 0.62);
      clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 36px 100%, 0 calc(100% - 36px));
    }

    .agenda-head {
      gap: 14px;
      color: #23e7ff;
      letter-spacing: 0.08em;
    }

    .pulse-line {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      height: 28px;
      min-width: 112px;
    }

    .pulse-line i {
      width: 3px;
      border-radius: 999px;
      background: linear-gradient(#22e6ff, #7c3aed);
      box-shadow: 0 0 10px rgba(34, 230, 255, 0.52);
    }

    .agenda-card h2 {
      font-size: 25px;
    }

    .next-payment {
      display: grid;
      grid-template-columns: 48px minmax(0, 1fr);
      gap: 10px;
      align-items: center;
      padding: 10px;
      border: 1px solid rgba(0, 195, 255, 0.16);
      border-radius: 12px;
      background: rgba(5, 12, 32, 0.62);
    }

    .next-payment > .material-symbols-rounded,
    .metric-card > .material-symbols-rounded,
    .capability-strip article > .material-symbols-rounded,
    .insight-item > .material-symbols-rounded {
      width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #b8a8ff;
      background: radial-gradient(circle at 35% 25%, rgba(124, 58, 237, 0.84), rgba(23, 37, 84, 0.6));
      box-shadow: 0 0 22px rgba(124, 58, 237, 0.34);
    }

    .next-payment small,
    .metric-card small,
    .metric-card em {
      display: block;
      color: #aebae2;
      font-size: 12px;
      font-style: normal;
    }

    .next-payment strong,
    .metric-card strong {
      display: block;
      margin-top: 3px;
      color: #27e29b;
      font-size: 21px;
    }

    .calendar-hud {
      position: relative;
      min-height: 274px;
      display: grid;
      place-items: center;
      isolation: isolate;
      overflow: hidden;
    }

    .hud-ring,
    .system-core {
      position: absolute;
      border-radius: 50%;
    }

    .hud-ring {
      border: 1px solid rgba(34, 230, 255, 0.26);
      background: radial-gradient(circle, rgba(0, 149, 255, 0.12), transparent 66%);
    }

    .hud-ring.outer {
      width: 272px;
      height: 272px;
      border-top-color: #38bdf8;
      animation: rotateSlow 16s linear infinite;
    }

    .hud-ring.middle {
      width: 214px;
      height: 214px;
      border-right-color: #7c3aed;
      animation: rotateSlow 11s linear infinite reverse;
    }

    .calendar-core {
      position: relative;
      z-index: 2;
      width: 214px;
      padding: 12px;
      border: 1px solid rgba(0, 195, 255, 0.2);
      border-radius: 16px;
      background: rgba(2, 10, 28, 0.78);
      box-shadow: 0 0 34px rgba(0, 149, 255, 0.3), inset 0 0 24px rgba(124, 58, 237, 0.16);
    }

    .month-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      color: #22e6ff;
      font-weight: 900;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 5px;
    }

    .calendar-grid span {
      height: 22px;
      display: grid;
      place-items: center;
      border-radius: 7px;
      color: #93a4cc;
      font-size: 11px;
      background: rgba(6, 13, 35, 0.72);
    }

    .calendar-grid span.active {
      color: #fff;
      background: rgba(56, 189, 248, 0.2);
    }

    .calendar-grid span.pay {
      color: #02040d;
      background: #27e29b;
      box-shadow: 0 0 18px rgba(39, 226, 155, 0.58);
    }

    .calendar-grid span.highlight {
      color: #fff;
      background: #7c3aed;
      box-shadow: 0 0 18px rgba(124, 58, 237, 0.58);
    }

    .sound-wave {
      position: absolute;
      bottom: 42px;
      width: 35%;
      height: 38px;
      opacity: 0.88;
      background:
        linear-gradient(90deg, transparent, rgba(34, 230, 255, 0.2), rgba(34, 230, 255, 0.95), rgba(124, 58, 237, 0.55), transparent),
        repeating-linear-gradient(90deg, transparent 0 8px, rgba(56, 189, 248, 0.58) 9px 11px, transparent 12px 18px);
      filter: drop-shadow(0 0 14px rgba(34, 230, 255, 0.56));
      clip-path: polygon(0 45%, 10% 55%, 20% 35%, 30% 70%, 40% 18%, 50% 86%, 60% 30%, 70% 62%, 80% 42%, 100% 55%, 100% 100%, 0 100%);
    }

    .sound-wave.left {
      left: 0;
    }

    .sound-wave.right {
      right: 0;
    }

    .calendar-caption {
      position: absolute;
      bottom: 5px;
      left: 50%;
      width: 220px;
      transform: translateX(-50%);
      text-align: center;
    }

    .calendar-caption strong,
    .calendar-caption small {
      display: block;
    }

    .calendar-caption small {
      color: #93a4cc;
      font-size: 10px;
    }

    .metric-stack {
      display: grid;
      gap: 10px;
      align-self: center;
    }

    .metric-card {
      display: grid;
      grid-template-columns: 48px minmax(0, 1fr);
      gap: 12px;
      align-items: center;
      min-height: 86px;
      padding: 12px;
      border: 1px solid rgba(0, 195, 255, 0.2);
      border-radius: 8px 18px 8px 18px;
      background: rgba(6, 13, 35, 0.76);
    }

    .capability-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin: 14px 0;
      padding: 14px 16px;
      border-radius: 6px 18px 6px 18px;
    }

    .capability-strip article {
      display: grid;
      grid-template-columns: 52px minmax(0, 1fr);
      gap: 10px;
      align-items: start;
    }

    .capability-strip h3 {
      font-size: 14px;
    }

    .capability-strip p {
      margin-top: 4px;
      font-size: 12px;
    }

    .content-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.65fr) minmax(300px, 0.78fr);
      gap: 14px;
    }

    .panel {
      padding: 14px;
      border-radius: 8px 18px 8px 18px;
    }

    .panel-heading {
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }

    .panel-heading h2 {
      font-size: 18px;
    }

    .panel-heading button {
      border: 0;
      color: #9f7cff;
      background: transparent;
      cursor: pointer;
    }

    .event-list {
      display: grid;
      gap: 10px;
    }

    .event-row {
      display: grid;
      grid-template-columns: 56px minmax(0, 1fr) 132px 22px;
      gap: 12px;
      min-height: 74px;
      padding: 11px 13px;
      border: 1px solid rgba(0, 195, 255, 0.16);
      border-radius: 12px;
      color: #f8fbff;
      text-decoration: none;
      background:
        radial-gradient(circle at 96% 88%, rgba(0, 195, 255, 0.14), transparent 28%),
        rgba(5, 12, 32, 0.78);
    }

    .date-box {
      width: 50px;
      height: 50px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      color: #02040d;
      background: #27e29b;
      box-shadow: 0 0 18px rgba(39, 226, 155, 0.48);
    }

    .date-box strong,
    .date-box span,
    .event-info span,
    .event-info strong,
    .event-info small,
    .event-value small,
    .event-value strong {
      display: block;
    }

    .date-box strong {
      font-size: 18px;
      line-height: 1;
    }

    .date-box span,
    .ticker {
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .ticker {
      color: #22e6ff;
    }

    .event-info strong {
      margin-top: 3px;
    }

    .event-value {
      text-align: right;
    }

    .event-value small {
      color: #aebae2;
      font-size: 12px;
    }

    .event-value strong {
      margin-top: 4px;
      color: #27e29b;
      font-size: 16px;
    }

    .insights-panel {
      display: grid;
      align-content: start;
      gap: 10px;
    }

    .insight-item {
      gap: 10px;
      padding: 9px 0;
    }

    .insight-item strong,
    .insight-item small {
      display: block;
    }

    .report-button {
      width: 100%;
      margin-top: 8px;
      color: #b794ff;
      background: rgba(29, 31, 91, 0.58);
    }

    .empty-state {
      display: grid;
      justify-items: center;
      gap: 10px;
      padding: 44px 20px;
      text-align: center;
    }

    .empty-state > .material-symbols-rounded {
      width: 66px;
      height: 66px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #b8a8ff;
      background: radial-gradient(circle at 35% 25%, rgba(124, 58, 237, 0.84), rgba(23, 37, 84, 0.6));
    }

    .empty-state p {
      color: #b8c5e8;
    }

    .system-footer {
      gap: 20px;
      min-height: 48px;
      margin-top: 14px;
      padding: 0 18px;
      overflow-x: auto;
      border: 1px solid rgba(0, 195, 255, 0.18);
      border-radius: 4px 18px 4px 18px;
      color: #9fb0dc;
      font-size: 12px;
      white-space: nowrap;
      background:
        linear-gradient(135deg, rgba(3, 10, 28, 0.88), rgba(2, 6, 18, 0.9)),
        radial-gradient(circle at 50% 50%, rgba(0, 195, 255, 0.24), transparent 18%);
    }

    .system-footer strong {
      color: #27e29b;
    }

    .system-core {
      width: 92px;
      height: 34px;
      flex: 0 0 92px;
      border: 1px solid rgba(0, 195, 255, 0.22);
      background: radial-gradient(circle, #22e6ff 0 8%, rgba(0, 149, 255, 0.34) 9% 20%, transparent 22%);
      box-shadow: 0 0 26px rgba(0, 149, 255, 0.5);
    }

    @keyframes rotateSlow {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 1220px) {
      .calendar-command,
      .content-grid {
        grid-template-columns: 1fr;
      }

      .metric-stack,
      .capability-strip {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 720px) {
      .calendar-os {
        padding: 12px;
      }

      .calendar-topbar,
      .period-switch {
        align-items: stretch;
        flex-direction: column;
      }

      .metric-stack,
      .capability-strip {
        grid-template-columns: 1fr;
      }

      .calendar-hud {
        min-height: 360px;
      }

      .event-row {
        grid-template-columns: 58px minmax(0, 1fr) 24px;
      }

      .event-value {
        display: none;
      }
    }
  `]
})
export class DividendsCalendarComponent implements OnInit {
  view: 'upcoming' | 'paid' = 'upcoming';
  waveformBars = [7, 15, 9, 24, 12, 18, 26, 10, 17, 8, 22, 13, 20, 9, 16, 25, 11, 18];
  calendarDays: CalendarDay[] = Array.from({ length: 30 }, (_, index) => {
    const day = index + 1;
    return {
      day,
      active: day >= 12 && day <= 26,
      pay: [15, 22, 25].includes(day),
      highlight: day === 20
    };
  });

  events: DividendEvent[] = [
    { symbol: 'PETR4', name: 'Petrobras', date: '15/04', amount: 0.9875, type: 'DIV', status: 'upcoming' },
    { symbol: 'ITUB4', name: 'Itaú Unibanco', date: '20/04', amount: 0.2756, type: 'JCP', status: 'upcoming' },
    { symbol: 'BBDC4', name: 'Bradesco', date: '22/04', amount: 0.2281, type: 'DIV', status: 'upcoming' },
    { symbol: 'VALE3', name: 'Vale', date: '25/04', amount: 1.82, type: 'JCP', status: 'upcoming' },
    { symbol: 'BBAS3', name: 'Banco do Brasil', date: '28/03', amount: 0.4421, type: 'DIV', status: 'paid' }
  ];

  private api = inject(ApiService);

  get filteredEvents(): DividendEvent[] {
    return this.events.filter(event => event.status === this.view);
  }

  get nextEvent(): DividendEvent | undefined {
    return this.events.find(event => event.status === 'upcoming');
  }

  get totalAmount(): number {
    return this.filteredEvents.reduce((sum, event) => sum + event.amount, 0);
  }

  get upcomingCount(): number {
    return this.events.filter(event => event.status === 'upcoming').length;
  }

  get trackedAssets(): number {
    return new Set(this.events.map(event => event.symbol)).size;
  }

  ngOnInit(): void {
    this.api.getDividendsBySymbol('PETR4').subscribe({
      next: data => {
        if (!data.length) {
          return;
        }
        this.events = data.map((dividend: any) => ({
          symbol: 'PETR4',
          name: 'Petrobras',
          date: dividend.eventDate?.split('-').reverse().slice(0, 2).join('/') ?? '',
          amount: dividend.dividendAmount ?? dividend.amount ?? 0,
          type: dividend.dividendType || 'DIV',
          status: 'upcoming'
        }));
      }
    });
  }
}
