import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../shared/components/card-input.component';
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
  imports: [CommonModule, RouterLink, CardComponent],
  template: `
    <div class="calendar-page">
      <h1>Calendário de Dividendos</h1>


      <div class="filters">
        <button [class.active]="view === 'upcoming'" (click)="view = 'upcoming'">Próximos</button>
        <button [class.active]="view === 'past'" (click)="view = 'past'">Histórico</button>
      </div>

      <div class="events-list">
        @for (event of events; track event.symbol + event.date) {
          <app-card [hoverable]="true" [routerLink]="['/market/detail', event.symbol]">
            <div class="event-date">
              <span class="day">{{ event.date.split('/')[0] }}</span>
              <span class="month">{{ event.date.split('/')[1] }}</span>
            </div>
            <div class="event-info">
              <span class="symbol">{{ event.symbol }}</span>
              <span class="name">{{ event.name }}</span>
            </div>
            <div class="event-amount" [class.jcp]="event.type === 'JCP'">
              <span class="amount">{{ event.amount | number:'1.4-4' }}</span>
              <span class="type">{{ event.type }}</span>
            </div>
          </app-card>
        }
      </div>

      @if (!events.length) {
        <div class="empty">Nenhum evento encontrado</div>
      }
    </div>
  `,
  styles: [`
    .calendar-page { padding: var(--space-lg); max-width: 900px; margin: 0 auto; }
    h1 { margin-bottom: var(--space-lg); }
    .filters { display: flex; gap: var(--space-sm); margin-bottom: var(--space-lg); }
    .filters button {
      padding: var(--space-sm) var(--space-md);
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text);
      cursor: pointer;
    }
    .filters button.active { background: var(--primary); border-color: var(--primary); }
    .events-list { display: flex; flex-direction: column; gap: var(--space-sm); }
    .event-date { width: 50px; text-align: center; }
    .event-date .day { font-size: var(--font-xl); font-weight: bold; display: block; }
    .event-date .month { font-size: var(--font-sm); color: var(--text-muted); text-transform: uppercase; }
    .event-info { flex: 1; }
    .event-info .symbol { font-weight: 600; display: block; }
    .event-info .name { font-size: var(--font-sm); color: var(--text-secondary); }
    .event-amount { text-align: right; }
    .event-amount .amount { font-size: var(--font-lg); font-weight: bold; display: block; }
    .event-amount .type { font-size: var(--font-xs); color: var(--text-muted); }
    .event-amount.jcp .amount { color: var(--warning); }
    .empty { text-align: center; padding: var(--space-2xl); color: var(--text-secondary); }
  `]
})
export class DividendsCalendarComponent implements OnInit {
  view: 'upcoming' | 'past' = 'upcoming';
  events: DividendEvent[] = [
    { symbol: 'PETR4', name: 'Petrobras', date: '15/04', amount: 0.9875, type: 'DIV' },
    { symbol: 'ITUB4', name: 'Itaú', date: '20/04', amount: 0.2756, type: 'JCP' },
    { symbol: 'BBDC4', name: 'Bradesco', date: '22/04', amount: 0.2281, type: 'DIV' },
    { symbol: 'VALE3', name: 'Vale', date: '25/04', amount: 1.8200, type: 'JCP' },
  ];
  private api = inject(ApiService);

  ngOnInit() {
    this.api.getDividendsBySymbol('PETR4').subscribe({
      next: data => {
        this.events = data.map((d: any) => ({
          symbol: 'PETR4',
          name: 'Ativo',
          date: d.eventDate?.split('-').reverse().join('/') ?? '',
          amount: d.dividendAmount ?? d.amount ?? 0,
          type: d.dividendType || 'DIV'
        }));
      }
    });
  }
}
