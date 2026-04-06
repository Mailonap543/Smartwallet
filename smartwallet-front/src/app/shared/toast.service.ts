import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  
  show(message: string, type: Toast['type'] = 'info', duration = 3000) {
    const id = Math.random().toString(36).substring(2);
    const toast: Toast = { id, message, type, duration };
    
    this.toasts.update(t => [...t, toast]);
    
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }
  
  success(message: string, duration = 3000) {
    this.show(message, 'success', duration);
  }
  
  error(message: string, duration = 5000) {
    this.show(message, 'error', duration);
  }
  
  warning(message: string, duration = 4000) {
    this.show(message, 'warning', duration);
  }
  
  info(message: string, duration = 3000) {
    this.show(message, 'info', duration);
  }
  
  remove(id: string) {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast-{{ toast.type }} animate-slide-up" (click)="toastService.remove(toast.id)">
          <span class="toast-icon">
            @switch (toast.type) {
              @case ('success') { ✓ }
              @case ('error') { ✕ }
              @case ('warning') { ⚠ }
              @case ('info') { ℹ }
            }
          </span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: var(--space-lg);
      right: var(--space-lg);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      max-width: 360px;
    }
    
    .toast {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md) var(--space-lg);
      border-radius: var(--radius-md);
      background: var(--card);
      box-shadow: var(--shadow-lg);
      cursor: pointer;
      transition: transform var(--transition-fast);
    }
    
    .toast:hover {
      transform: scale(1.02);
    }
    
    .toast-icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: var(--font-sm);
      font-weight: bold;
    }
    
    .toast-success .toast-icon {
      background: var(--success);
      color: var(--background);
    }
    
    .toast-error .toast-icon {
      background: var(--error);
      color: var(--text);
    }
    
    .toast-warning .toast-icon {
      background: var(--warning);
      color: var(--background);
    }
    
    .toast-info .toast-icon {
      background: var(--primary);
      color: var(--text);
    }
    
    .toast-message {
      font-size: var(--font-sm);
      color: var(--text);
    }
    
    .toast-success { border-left: 3px solid var(--success); }
    .toast-error { border-left: 3px solid var(--error); }
    .toast-warning { border-left: 3px solid var(--warning); }
    .toast-info { border-left: 3px solid var(--primary); }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}