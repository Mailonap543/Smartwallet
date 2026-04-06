import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container" [class.loading-centered]="centered">
      <div class="spinner" [style.width.px]="size" [style.height.px]="size"></div>
      @if (message) {
        <p class="loading-message">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-lg);
    }
    
    .loading-centered {
      justify-content: center;
      min-height: 200px;
    }
    
    .spinner {
      border: 3px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    .loading-message {
      color: var(--text-secondary);
      font-size: var(--font-sm);
      margin: 0;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoadingComponent {
  @Input() size = 32;
  @Input() message = '';
  @Input() centered = true;
}

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <div class="skeleton" [style.width]="width" [style.height]="height" [style.border-radius]="radius"></div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(90deg, var(--card) 25%, var(--card-hover) 50%, var(--card) 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s ease-in-out infinite;
    }
    
    @keyframes skeleton-loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '20px';
  @Input() radius = 'var(--radius-sm)';
}

@Component({
  selector: 'app-skeleton-group',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="skeleton-group" [style.gap.gap]="gap">
      <app-skeleton 
        *ngFor="let i of items; let idx = index" 
        [style.width]="width"
        [style.height]="height"
        [style.border-radius]="radius"
        [class]="'stagger-' + (idx + 1)"
      ></app-skeleton>
    </div>
  `,
  styles: [`
    .skeleton-group {
      display: flex;
      flex-direction: column;
    }
  `]
})
export class SkeletonGroupComponent {
  @Input() count = 3;
  @Input() width = '100%';
  @Input() height = '20px';
  @Input() radius = 'var(--radius-sm)';
  @Input() gap = 8;
  
  get items(): number[] {
    return Array(this.count).fill(0);
  }
}