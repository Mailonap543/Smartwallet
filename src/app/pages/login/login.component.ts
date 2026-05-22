import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="login-page">
      <section class="login-panel">
        <div class="brand">
          <span class="brand-mark">SW</span>
          <div>
            <h1>SmartWallet</h1>
            <p>Acesse sua carteira inteligente</p>
          </div>
        </div>

        <form (ngSubmit)="onSubmit()" class="login-form">
          <label>
            Email
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="seu@email.com"
              autocomplete="email"
              required
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="Sua senha"
              autocomplete="current-password"
              required
            />
          </label>

          @if (error) {
            <p class="error">{{ error }}</p>
          }

          <button type="submit" [disabled]="auth.isLoading()">
            {{ auth.isLoading() ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <p class="signup">
          Ainda nao tem conta?
          <a routerLink="/register">Criar conta</a>
        </p>
      </section>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      color: #172033;
      background:
        radial-gradient(circle at top left, rgba(45, 116, 255, 0.18), transparent 34rem),
        linear-gradient(135deg, #f6f8fc 0%, #e8edf7 100%);
    }

    .login-page {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
    }

    .login-panel {
      width: min(100%, 420px);
      background: rgba(255, 255, 255, 0.94);
      border: 1px solid rgba(123, 139, 166, 0.22);
      border-radius: 18px;
      box-shadow: 0 24px 70px rgba(26, 43, 77, 0.16);
      padding: 32px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 28px;
    }

    .brand-mark {
      width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      border-radius: 14px;
      background: #2563eb;
      color: #ffffff;
      font-weight: 800;
      letter-spacing: 0;
    }

    h1 {
      margin: 0;
      font-size: 1.65rem;
      line-height: 1.15;
      color: #101828;
    }

    p {
      margin: 0;
    }

    .brand p,
    .signup {
      color: #667085;
      font-size: 0.95rem;
    }

    .login-form {
      display: grid;
      gap: 16px;
    }

    label {
      display: grid;
      gap: 8px;
      color: #344054;
      font-size: 0.92rem;
      font-weight: 700;
    }

    input {
      width: 100%;
      min-height: 46px;
      border: 1px solid #cfd6e4;
      border-radius: 10px;
      padding: 0 14px;
      color: #101828;
      background: #ffffff;
      outline: none;
      font: inherit;
      box-sizing: border-box;
    }

    input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
    }

    button {
      min-height: 48px;
      border: 0;
      border-radius: 10px;
      background: #2563eb;
      color: #ffffff;
      font: inherit;
      font-weight: 800;
      cursor: pointer;
    }

    button:hover:not(:disabled) {
      background: #1d4ed8;
    }

    button:disabled {
      opacity: 0.65;
      cursor: wait;
    }

    .error {
      padding: 10px 12px;
      border-radius: 10px;
      background: #fee2e2;
      color: #b42318;
      font-size: 0.9rem;
      font-weight: 700;
    }

    .signup {
      margin-top: 22px;
      text-align: center;
    }

    .signup a {
      color: #2563eb;
      font-weight: 800;
      text-decoration: none;
    }
  `]
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);
  email = '';
  password = '';
  error = '';

  onSubmit() {
    this.error = '';

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Erro ao fazer login';
      }
    });
  }
}
