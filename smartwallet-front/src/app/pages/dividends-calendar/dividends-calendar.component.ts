import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface DividendEvent {
  symbol: string;
  name: string;
  date: string;
  amount: number;
  type: string;
}

@Component({
  selector: 'app-dividends-calendar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="calendar-page">
      <header class="calendar-hero">
        <div>
          <span class="eyebrow">Agenda</span>
          <h1>Calendario de Dividendos</h1>
          <p>Acompanhe os proximos pagamentos e historico de proventos.</p>
        </div>
        <button class="primary-action" type="button" routerLink="/market">
          <span class="material-symbols-rounded" aria-hidden="true">add</span>
          Adicionar ativo
        </button>
      </header>

      <nav class="filters" aria-label="Filtros do calendario">
        <button [class.active]="view === 'upcoming'" (click)="view = 'upcoming'">
          <span class="material-symbols-rounded" aria-hidden="true">event_upcoming</span>
          Proximos
        </button>
        <button [class.active]="view === 'past'" (click)="view = 'past'">
          <span class="material-symbols-rounded" aria-hidden="true">history</span>
          Historico
        </button>
      </nav>

      <section class="events-panel">
        <div class="panel-header">
          <div>
            <h2>{{ view === 'upcoming' ? 'Proximos eventos' : 'Historico de eventos' }}</h2>
            <p>{{ filteredEvents.length }} evento(s) encontrado(s)</p>
          </div>
        </div>

        @if (filteredEvents.length) {
          <div class="events-list">
            @for (event of filteredEvents; track event.symbol + event.date + event.type) {
              <a class="event-row" [routerLink]="['/market/detail', event.symbol]">
                <div class="event-date">
                  <strong>{{ event.date.split('/')[0] }}</strong>
                  <span>{{ event.date.split('/')[1] }}</span>
                </div>
                <div class="event-info">
                  <span class="symbol">{{ event.symbol }}</span>
                  <span class="name">{{ event.name }}</span>
                </div>
                <div class="event-amount" [class.jcp]="event.type === 'JCP'">
                  <strong>{{ event.amount | number:'1.4-4' }}</strong>
                  <span>{{ event.type }}</span>
                </div>
                <span class="row-arrow material-symbols-rounded" aria-hidden="true">chevron_right</span>
              </a>
            }
          </div>
        } @else {
          <div class="empty">
            <span class="material-symbols-rounded" aria-hidden="true">event_busy</span>
            <h3>Nenhum evento encontrado</h3>
            <p>Quando houver proventos, eles aparecem organizados aqui.</p>
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .calendar-page {
      min-height: 100%;
      padding: 28px;
      color: #0f172a;
    }

    .calendar-hero,
    .events-panel {
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 26px;
      background: rgba(255, 255, 255, 0.88);
      box-shadow: 0 22px 60px rgba(15, 23, 42, 0.09);
    }

    .calendar-hero {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
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

    h1, h2, h3, p {
      margin: 0;
    }

    h1 {
      font-size: 38px;
      line-height: 1;
    }

    .calendar-hero p,
    .panel-header p,
    .empty p {
      margin-top: 8px;
      color: #64748b;
      font-size: 14px;
    }

    .primary-action {
      min-height: 46px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 0;
      border-radius: 15px;
      padding: 0 18px;
      color: #fff;
      font-weight: 900;
      cursor: pointer;
      background: linear-gradient(135deg, #6729ff, #3187ff 48%, #27e29b);
      box-shadow: 0 18px 42px rgba(16, 185, 129, 0.22);
    }

    .filters {
      display: inline-flex;
      gap: 6px;
      padding: 6px;
      margin: 18px 0;
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.78);
      box-shadow: 0 16px 38px rgba(15, 23, 42, 0.06);
    }

    .filters button {
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
    }

    .filters button.active {
      color: #fff;
      background: linear-gradient(135deg, #16a467, #0f8b59);
      box-shadow: 0 12px 26px rgba(16, 185, 129, 0.18);
    }

    .events-panel {
      padding: 22px;
    }

    .panel-header {
      margin-bottom: 16px;
    }

    .events-list {
      display: grid;
      gap: 10px;
    }

    .event-row {
      display: grid;
      grid-template-columns: 64px minmax(0, 1fr) 120px 28px;
      align-items: center;
      gap: 14px;
      min-height: 76px;
      padding: 12px 14px;
      border: 1px solid rgba(148, 163, 184, 0.14);
      border-radius: 18px;
      color: #0f172a;
      text-decoration: none;
      background: rgba(248, 250, 252, 0.74);
      transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
    }

    .event-row:hover {
      transform: translateY(-2px);
      border-color: rgba(16, 185, 129, 0.22);
      box-shadow: 0 16px 36px rgba(15, 23, 42, 0.09);
    }

    .event-date {
      width: 58px;
      height: 58px;
      display: grid;
      place-items: center;
      border-radius: 18px;
      color: #fff;
      background: linear-gradient(145deg, #6729ff, #27e29b);
    }

    .event-date strong,
    .event-date span,
    .event-info span,
    .event-amount strong,
    .event-amount span {
      display: block;
    }

    .event-date strong {
      font-size: 20px;
      line-height: 1;
    }

    .event-date span {
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
    }

    .symbol,
    .event-amount strong {
      font-weight: 900;
    }

    .name,
    .event-amount span {
      margin-top: 4px;
      color: #64748b;
      font-size: 12px;
      font-weight: 700;
    }

    .event-amount {
      text-align: right;
    }

    .event-amount.jcp strong {
      color: #d97706;
    }

    .row-arrow {
      color: #94a3b8;
    }

    .empty {
      display: grid;
      justify-items: center;
      gap: 10px;
      padding: 48px 22px;
      text-align: center;
    }

    .empty > .material-symbols-rounded {
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
      .calendar-page {
        color: #f8fafc;
      }

      .calendar-hero,
      .events-panel,
      .filters {
        border-color: rgba(124, 58, 237, 0.22);
        background:
          radial-gradient(circle at 12% 0%, rgba(124, 58, 237, 0.2), transparent 36%),
          rgba(13, 15, 40, 0.86);
      }

      .event-row {
        color: #f8fafc;
        border-color: rgba(124, 58, 237, 0.18);
        background: rgba(10, 14, 38, 0.72);
      }

      .calendar-hero p,
      .panel-header p,
      .empty p,
      .name,
      .event-amount span {
        color: #b8c1dd;
      }
    }

    @media (max-width: 760px) {
      .calendar-page {
        padding: 18px;
      }

      .calendar-hero {
        align-items: flex-start;
        flex-direction: column;
      }

      .primary-action {
        width: 100%;
      }

      .event-row {
        grid-template-columns: 58px 1fr 28px;
      }

      .event-amount {
        display: none;
      }
    }
  `]
})
export class DividendsCalendarComponent implements OnInit {
  view: 'upcoming' | 'past' = 'upcoming';
  events: DividendEvent[] = [
    { symbol: 'PETR4', name: 'Petrobras', date: '15/04', amount: 0.9875, type: 'DIV' },
    { symbol: 'ITUB4', name: 'Itau', date: '20/04', amount: 0.2756, type: 'JCP' },
    { symbol: 'BBDC4', name: 'Bradesco', date: '22/04', amount: 0.2281, type: 'DIV' },
    { symbol: 'VALE3', name: 'Vale', date: '25/04', amount: 1.82, type: 'JCP' },
  ];

  private api = inject(ApiService);

  get filteredEvents(): DividendEvent[] {
    return this.events;
  }

  ngOnInit() {
    this.api.getDividendsBySymbol('PETR4').subscribe({
      next: data => {
        if (!data.length) {
          return;
        }
        this.events = data.map((dividend: any) => ({
          symbol: 'PETR4',
          name: 'Ativo',
          date: dividend.eventDate?.split('-').reverse().slice(0, 2).join('/') ?? '',
          amount: dividend.dividendAmount ?? dividend.amount ?? 0,
          type: dividend.dividendType || 'DIV'
        }));
      }
    });
  }
}
