import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="'btn btn-' + variant + ' btn-' + size + (loading ? ' btn-loading' : '')"
      (click)="handleClick($event)"
    >
      <span class="btn-content">
        @if (loading) {
          <span class="spinner"></span>
        }
        <ng-content></ng-content>
      </span>
    </button>
  `,
  styles: [`
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
      border: none;
      border-radius: 14px;
      font-weight: 800;
      letter-spacing: 0;
      cursor: pointer;
      transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease, border-color 160ms ease;
      position: relative;
      overflow: hidden;
    }

    .btn::before {
      position: absolute;
      inset: 0;
      content: '';
      opacity: 0;
      background: linear-gradient(120deg, rgba(255, 255, 255, 0.22), transparent 42%);
      transition: opacity 160ms ease;
    }

    .btn:hover:not(:disabled)::before {
      opacity: 1;
    }

    .btn:hover:not(:disabled) {
      transform: translateY(-2px);
    }
    
    .btn:active:not(:disabled) {
      transform: scale(0.98);
    }
    
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .btn-sm {
      min-height: 38px;
      padding: 0 var(--space-md);
      font-size: var(--font-sm);
    }
    
    .btn-md {
      min-height: 46px;
      padding: 0 var(--space-lg);
      font-size: var(--font-md);
    }
    
    .btn-lg {
      min-height: 54px;
      padding: 0 var(--space-xl);
      font-size: var(--font-lg);
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #6729ff, #3187ff 48%, #27e29b);
      color: #ffffff;
      box-shadow: 0 16px 34px rgba(39, 226, 155, 0.18);
    }
    
    .btn-primary:hover:not(:disabled) {
      box-shadow: 0 22px 48px rgba(39, 226, 155, 0.24);
    }
    
    .btn-secondary {
      background: var(--card);
      color: var(--text);
      border: 1px solid var(--border);
    }
    
    .btn-secondary:hover:not(:disabled) {
      background: var(--card-hover);
      border-color: var(--border-light);
    }
    
    .btn-ghost {
      background: transparent;
      color: var(--text-secondary);
    }
    
    .btn-ghost:hover:not(:disabled) {
      background: var(--card);
      color: var(--text);
    }
    
    .btn-danger {
      background: var(--error);
      color: var(--text);
    }
    
    .btn-danger:hover:not(:disabled) {
      background: var(--error-light);
    }
    
    .btn-success {
      background: var(--success);
      color: var(--background);
    }
    
    .btn-success:hover:not(:disabled) {
      background: var(--success-light);
    }
    
    .btn-loading {
      pointer-events: none;
    }
    
    .btn-content {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      position: relative;
      z-index: 1;
      opacity: 1;
      transition: opacity var(--transition-fast);
    }
    
    .btn-loading .btn-content {
      opacity: 1;
    }
    
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Output() onClick = new EventEmitter<Event>();
  
  handleClick(event: Event) {
    if (!this.disabled && !this.loading) {
      this.onClick.emit(event);
    }
  }
}
