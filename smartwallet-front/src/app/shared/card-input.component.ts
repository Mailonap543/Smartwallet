import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="card" [class.card-hoverable]="hoverable" [class.card-clickable]="clickable">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .card {
      background: var(--card);
      border-radius: var(--radius-md);
      padding: var(--space-lg);
      border: 1px solid var(--border);
      transition: all var(--transition-fast);
    }
    
    .card-hoverable:hover {
      border-color: var(--border-light);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    
    .card-clickable {
      cursor: pointer;
    }
    
    .card-clickable:active {
      transform: scale(0.99);
    }
  `]
})
export class CardComponent {
  @Input() hoverable = false;
  @Input() clickable = false;
}

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="input-wrapper" [class.input-focused]="focused" [class.input-error]="error" [class.input-disabled]="disabled">
      @if (label) {
        <label class="input-label">{{ label }}</label>
      }
      <div class="input-container">
        @if (prefixIcon) {
          <span class="input-prefix">{{ prefixIcon }}</span>
        }
        <input
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [(ngModel)]="value"
          (focus)="focused = true"
          (blur)="focused = false; onTouched()"
          (input)="onInput($event)"
          class="input-field"
        />
        @if (suffixIcon) {
          <span class="input-suffix">{{ suffixIcon }}</span>
        }
        @if (loading) {
          <span class="input-loading"></span>
        }
      </div>
      @if (error && errorMessage) {
        <span class="input-error-message">{{ errorMessage }}</span>
      }
    </div>
  `,
  styles: [`
    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }
    
    .input-label {
      font-size: var(--font-sm);
      color: var(--text-secondary);
      font-weight: 500;
    }
    
    .input-container {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    .input-field {
      width: 100%;
      padding: var(--space-md);
      background: var(--background-alt);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text);
      font-size: var(--font-md);
      transition: all var(--transition-fast);
      outline: none;
    }
    
    .input-field::placeholder {
      color: var(--text-muted);
    }
    
    .input-field:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(130, 10, 209, 0.2);
    }
    
    .input-focused .input-field {
      border-color: var(--primary);
    }
    
    .input-error .input-field {
      border-color: var(--error);
    }
    
    .input-disabled .input-field {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .input-prefix, .input-suffix {
      position: absolute;
      color: var(--text-muted);
    }
    
    .input-prefix {
      left: var(--space-md);
    }
    
    .input-suffix {
      right: var(--space-md);
    }
    
    .input-field {
      padding-left: var(--space-2xl);
    }
    
    .input-field:has(~ .input-suffix) {
      padding-right: var(--space-2xl);
    }
    
    .input-loading {
      position: absolute;
      right: var(--space-md);
      width: 16px;
      height: 16px;
      border: 2px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    .input-error-message {
      font-size: var(--font-xs);
      color: var(--error);
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' = 'text';
  @Input() placeholder = '';
  @Input() prefixIcon = '';
  @Input() suffixIcon = '';
  @Input() loading = false;
  @Input() error = false;
  @Input() errorMessage = '';
  @Input() disabled = false;
  @Input() readonly = false;
  
  value = '';
  focused = false;
  
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  
  writeValue(value: string): void {
    this.value = value;
  }
  
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
  
  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
  }
}