import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../shared/card-input.component';

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  source: string;
  date: string;
  relatedAssets: string[];
  url: string;
}

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent],
  template: `
    <div class="news-page">
      <h1>Notícias</h1>

      <div class="filters">
        <button [class.active]="!selectedCategory" (click)="selectedCategory = ''">Todas</button>
        <button [class.active]="selectedCategory === 'market'" (click)="selectedCategory = 'market'">Mercado</button>
        <button [class.active]="selectedCategory === 'earnings'" (click)="selectedCategory = 'earnings'">Resultados</button>
        <button [class.active]="selectedCategory === 'macro'" (click)="selectedCategory = 'macro'">Macro</button>
      </div>

      <div class="news-list">
        @for (news of newsItems; track news.id) {
          <app-card [hoverable]="true" class="news-item">
            <div class="news-content">
              <span class="source">{{ news.source }} • {{ news.date }}</span>
              <h3>{{ news.title }}</h3>
              <p>{{ news.summary }}</p>
              @if (news.relatedAssets.length) {
                <div class="related">
                  @for (symbol of news.relatedAssets; track symbol) {
                    <a [routerLink]="['/market/detail', symbol]" class="tag">{{ symbol }}</a>
                  }
                </div>
              }
            </div>
          </app-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .news-page { padding: var(--space-lg); max-width: 900px; margin: 0 auto; }
    h1 { margin-bottom: var(--space-lg); }
    .filters { display: flex; gap: var(--space-sm); margin-bottom: var(--space-lg); flex-wrap: wrap; }
    .filters button {
      padding: var(--space-sm) var(--space-md);
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text);
      cursor: pointer;
    }
    .filters button.active { background: var(--primary); border-color: var(--primary); }
    .news-list { display: flex; flex-direction: column; gap: var(--space-md); }
    .news-item { padding: var(--space-lg); }
    .news-content .source { font-size: var(--font-xs); color: var(--text-muted); display: block; margin-bottom: var(--space-xs); }
    .news-content h3 { margin: 0 0 var(--space-sm); font-size: var(--font-lg); }
    .news-content p { margin: 0 0 var(--space-md); color: var(--text-secondary); font-size: var(--font-sm); }
    .related { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
    .tag { padding: var(--space-xs) var(--space-sm); background: var(--card-hover); border-radius: var(--radius-sm); font-size: var(--font-xs); }
  `]
})
export class NewsComponent {
  selectedCategory = '';
  newsItems: NewsItem[] = [
    { id: 1, title: 'Petrobras anuncia novo recorde de produção', summary: 'A estatal afirmou que atingiu produção histórica no pré-sal...', source: 'InfoMoney', date: '2h atrás', relatedAssets: ['PETR4', 'PETR3'], url: '' },
    { id: 2, title: 'Itaú reporta lucro acima do esperado', summary: 'O maior banco do Brasil registrou lucro líquido de R$ 8,5 bilhões...', source: 'Valor', date: '4h atrás', relatedAssets: ['ITUB4'], url: '' },
    { id: 3, title: 'Copom mantém juros estável', summary: 'Comitê decide manter taxa de juros em 10,50%...', source: 'Globo', date: '5h atrás', relatedAssets: [], url: '' },
  ];
}
