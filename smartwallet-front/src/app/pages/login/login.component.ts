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
    <main class="auth-page login-page">
      <section class="login-card">
        <a class="brand" routerLink="/home" aria-label="Smartwallet">
          <span class="brand-symbol">W</span>
          <span>Smart<strong>wallet</strong></span>
        </a>

        <header class="auth-header">
          <h1>Bem-vindo de <span>volta!</span></h1>
          <p>Acesse sua conta e continue investindo com inteligencia.</p>
        </header>

        <form class="auth-form" (ngSubmit)="onSubmit()">
          <label class="field">
            <span>E-mail</span>
            <div class="input-shell">
              <span class="material-symbols-rounded" aria-hidden="true">mail</span>
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                placeholder="seu@email.com"
                autocomplete="email"
                required
              />
            </div>
          </label>

          <label class="field">
            <span>Senha</span>
            <div class="input-shell">
              <span class="material-symbols-rounded" aria-hidden="true">lock</span>
              <input
                [type]="showPassword ? 'text' : 'password'"
                [(ngModel)]="password"
                name="password"
                placeholder="Digite sua senha"
                autocomplete="current-password"
                required
              />
              <button class="icon-button" type="button" (click)="showPassword = !showPassword" aria-label="Mostrar ou ocultar senha">
                <span class="material-symbols-rounded" aria-hidden="true">{{ showPassword ? 'visibility' : 'visibility_off' }}</span>
              </button>
            </div>
          </label>

          <a class="forgot-link" routerLink="/login">Esqueceu sua senha?</a>

          @if (error) {
            <p class="error">{{ error }}</p>
          }

          <button class="primary-action" type="submit" [disabled]="auth.isLoading()">
            {{ auth.isLoading() ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <div class="divider"><span>ou continue com</span></div>

        <div class="social-grid" aria-label="Metodos de login social">
          <button type="button" (click)="loginWithProvider('Google')" aria-label="Entrar com Google">
            <span class="google">G</span>
            Google
          </button>
          <button type="button" (click)="loginWithProvider('Apple')" aria-label="Entrar com Apple">
            <span class="apple">A</span>
            Apple
          </button>
          <button type="button" (click)="loginWithProvider('Microsoft')" aria-label="Entrar com Microsoft">
            <span class="microsoft" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
            Microsoft
          </button>
        </div>

        <p class="switch-link">Ainda nao tem uma conta? <a routerLink="/register">Criar conta</a></p>

        <section class="security-card">
          <div class="security-visual">
            <span class="material-symbols-rounded" aria-hidden="true">shield_lock</span>
          </div>
          <div>
            <h2>Sua seguranca e <span>nossa prioridade</span></h2>
            <p>Utilizamos protecao avancada para cuidar dos seus dados e investimentos.</p>
          </div>
        </section>
      </section>

      <section class="wallet-visual" aria-hidden="true">
        <div class="chart-grid"></div>
        <div class="wallet-object">
          <span>W</span>
          <div class="wallet-button"></div>
        </div>
        <div class="glow-ring"></div>
      </section>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      color: #fff;
      background: #020617;
    }

    .auth-page {
      position: relative;
      min-height: 100vh;
      overflow: hidden;
      display: grid;
      place-items: center;
      padding: 44px 24px;
      background:
        radial-gradient(circle at 50% -10%, rgba(124, 58, 237, 0.26), transparent 34%),
        radial-gradient(circle at 15% 90%, rgba(37, 99, 235, 0.22), transparent 32%),
        radial-gradient(circle at 85% 70%, rgba(16, 185, 129, 0.18), transparent 28%),
        #020617;
    }

    .auth-page::before,
    .auth-page::after {
      position: absolute;
      width: 360px;
      height: 360px;
      border-radius: 50%;
      content: '';
      pointer-events: none;
      filter: blur(20px);
    }

    .auth-page::before {
      top: -160px;
      right: 18%;
      background: radial-gradient(circle, rgba(105, 41, 255, 0.18), transparent 68%);
    }

    .auth-page::after {
      left: -140px;
      bottom: 8%;
      background: radial-gradient(circle, rgba(39, 226, 155, 0.14), transparent 70%);
    }

    .login-card {
      position: relative;
      z-index: 2;
      width: min(100%, 760px);
      display: grid;
      gap: 22px;
      justify-items: center;
    }

    .brand {
      display: grid;
      justify-items: center;
      gap: 10px;
      color: #fff;
      font-size: 46px;
      font-weight: 900;
      line-height: 1;
      text-decoration: none;
    }

    .brand strong,
    h1 span,
    .security-card h2 span,
    .switch-link a,
    .forgot-link {
      color: #27e29b;
    }

    .brand-symbol {
      width: 94px;
      height: 74px;
      display: grid;
      place-items: center;
      border-radius: 22px;
      color: transparent;
      font-size: 54px;
      font-weight: 1000;
      background: linear-gradient(135deg, #6929ff, #24e49d);
      -webkit-background-clip: text;
      background-clip: text;
      filter: drop-shadow(0 18px 32px rgba(105, 41, 255, 0.34));
    }

    .brand:hover .brand-symbol {
      filter: drop-shadow(0 22px 42px rgba(39, 226, 155, 0.26));
      transform: translateY(-1px);
    }

    .auth-header {
      text-align: center;
    }

    h1 {
      margin: 0;
      font-size: clamp(34px, 5vw, 52px);
      line-height: 1.06;
      letter-spacing: 0;
    }

    .auth-header p {
      max-width: 450px;
      margin: 18px auto 0;
      color: #c6cbea;
      font-size: 22px;
      line-height: 1.35;
    }

    .auth-form {
      width: min(100%, 620px);
      display: grid;
      gap: 22px;
    }

    .field {
      display: grid;
      gap: 10px;
      color: #fff;
      font-size: 20px;
      font-weight: 800;
    }

    .input-shell {
      min-height: 66px;
      display: grid;
      grid-template-columns: 34px minmax(0, 1fr) 42px;
      align-items: center;
      gap: 14px;
      padding: 0 22px;
      border: 1px solid rgba(139, 148, 196, 0.32);
      border-radius: 18px;
      background: rgba(8, 12, 34, 0.78);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
      transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
    }

    .input-shell:hover {
      border-color: rgba(139, 92, 246, 0.46);
      background: rgba(10, 14, 42, 0.84);
    }

    .input-shell:focus-within {
      border-color: rgba(39, 226, 155, 0.75);
      box-shadow: 0 0 0 4px rgba(39, 226, 155, 0.12), 0 16px 38px rgba(80, 47, 255, 0.16);
    }

    .input-shell > .material-symbols-rounded {
      color: #8b5cf6;
      font-size: 30px;
    }

    input {
      width: 100%;
      border: 0;
      outline: 0;
      color: #fff;
      background: transparent;
      font-size: 20px;
    }

    input::placeholder {
      color: #aeb5d8;
    }

    .icon-button {
      width: 38px;
      height: 38px;
      display: grid;
      place-items: center;
      border: 0;
      color: #8b5cf6;
      background: transparent;
      cursor: pointer;
    }

    .forgot-link {
      justify-self: end;
      margin-top: -8px;
      font-size: 18px;
      font-weight: 700;
      text-decoration: none;
    }

    .primary-action {
      min-height: 72px;
      border: 0;
      border-radius: 18px;
      color: #fff;
      font-size: 26px;
      font-weight: 900;
      cursor: pointer;
      background: linear-gradient(100deg, #6729ff, #3187ff 48%, #27e29b);
      box-shadow: 0 22px 55px rgba(39, 226, 155, 0.2);
      transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease;
    }

    .primary-action:hover:not(:disabled) {
      transform: translateY(-2px);
      filter: brightness(1.05);
      box-shadow: 0 28px 70px rgba(39, 226, 155, 0.26);
    }

    .primary-action:disabled {
      opacity: 0.65;
      cursor: wait;
    }

    .error {
      margin: 0;
      padding: 12px 14px;
      border: 1px solid rgba(248, 113, 113, 0.28);
      border-radius: 14px;
      color: #fecaca;
      background: rgba(127, 29, 29, 0.32);
      font-weight: 700;
    }

    .divider {
      width: min(100%, 620px);
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 18px;
      color: #b8bddb;
      font-size: 18px;
    }

    .divider::before,
    .divider::after {
      height: 1px;
      content: '';
      background: rgba(184, 189, 219, 0.28);
    }

    .social-grid {
      width: min(100%, 620px);
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
    }

    .social-grid button {
      min-height: 66px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      border: 1px solid rgba(139, 148, 196, 0.26);
      border-radius: 16px;
      color: #fff;
      font-size: 20px;
      font-weight: 800;
      background: rgba(10, 14, 38, 0.78);
      cursor: pointer;
      transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
    }

    .social-grid button:hover {
      transform: translateY(-2px);
      border-color: rgba(39, 226, 155, 0.42);
      background: rgba(14, 19, 52, 0.92);
    }

    .google {
      color: #4285f4;
      font-weight: 1000;
    }

    .apple {
      width: 26px;
      height: 26px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #fff;
      font-size: 15px;
      font-weight: 1000;
      background: rgba(255, 255, 255, 0.12);
    }

    .microsoft {
      width: 22px;
      height: 22px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3px;
    }

    .microsoft i:nth-child(1) { background: #f25022; }
    .microsoft i:nth-child(2) { background: #7fba00; }
    .microsoft i:nth-child(3) { background: #00a4ef; }
    .microsoft i:nth-child(4) { background: #ffb900; }

    .switch-link {
      margin: 0;
      color: #c6cbea;
      font-size: 20px;
      text-align: center;
    }

    .switch-link a {
      font-weight: 900;
      text-decoration: none;
    }

    .security-card {
      width: min(100%, 460px);
      justify-self: end;
      display: grid;
      grid-template-columns: 82px 1fr;
      align-items: center;
      gap: 22px;
      margin-top: 42px;
      padding: 28px;
      border: 1px solid rgba(139, 148, 196, 0.22);
      border-radius: 24px;
      background: rgba(10, 14, 38, 0.7);
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.22);
      backdrop-filter: blur(18px);
    }

    .security-visual {
      width: 82px;
      height: 82px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #27e29b;
      background: radial-gradient(circle, rgba(39, 226, 155, 0.22), rgba(105, 41, 255, 0.36));
    }

    .security-visual .material-symbols-rounded {
      font-size: 42px;
    }

    .security-card h2 {
      margin: 0;
      font-size: 26px;
      line-height: 1.15;
    }

    .security-card p {
      margin: 12px 0 0;
      color: #c6cbea;
      font-size: 18px;
      line-height: 1.4;
    }

    .wallet-visual {
      position: absolute;
      left: 8%;
      bottom: 5%;
      width: 360px;
      height: 300px;
      opacity: 0.72;
    }

    .chart-grid {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(120deg, transparent 0 42%, rgba(139, 92, 246, 0.58) 43% 45%, transparent 46%),
        repeating-linear-gradient(90deg, rgba(139, 92, 246, 0.16) 0 2px, transparent 2px 36px);
      mask-image: linear-gradient(to top, #000, transparent 84%);
    }

    .wallet-object {
      position: absolute;
      left: 56px;
      bottom: 38px;
      width: 240px;
      height: 150px;
      display: grid;
      place-items: center;
      border: 2px solid rgba(39, 226, 155, 0.55);
      border-radius: 28px;
      background: linear-gradient(145deg, #07102f, #11194a);
      box-shadow: 0 0 44px rgba(39, 226, 155, 0.24);
    }

    .wallet-object span {
      color: transparent;
      font-size: 58px;
      font-weight: 1000;
      background: linear-gradient(135deg, #6929ff, #24e49d);
      -webkit-background-clip: text;
      background-clip: text;
    }

    .wallet-button {
      position: absolute;
      right: -16px;
      width: 70px;
      height: 58px;
      border-radius: 18px;
      background: #07102f;
      border: 2px solid rgba(39, 226, 155, 0.65);
    }

    .wallet-button::after {
      position: absolute;
      right: 17px;
      top: 16px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      content: '';
      background: #27e29b;
    }

    .glow-ring {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 70px;
      border: 1px solid rgba(105, 41, 255, 0.4);
      border-radius: 50%;
      filter: blur(0.2px);
    }

    @media (max-width: 900px) {
      .wallet-visual {
        display: none;
      }

      .security-card {
        justify-self: center;
      }
    }

    @media (max-width: 640px) {
      .auth-page {
        padding: 28px 16px;
      }

      .brand {
        font-size: 34px;
      }

      .auth-header p,
      .field,
      input,
      .switch-link {
        font-size: 16px;
      }

      .input-shell {
        min-height: 58px;
      }

      .primary-action {
        min-height: 62px;
        font-size: 20px;
      }

      .social-grid {
        grid-template-columns: 1fr;
      }

      .security-card {
        grid-template-columns: 1fr;
        text-align: center;
      }
    }
  `]
})
export class LoginComponent {
  protected auth = inject(AuthService);
  private readonly router = inject(Router);

  protected email = '';
  protected password = '';
  protected error = '';
  protected showPassword = false;

  protected onSubmit(): void {
    this.error = '';

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        void this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Erro ao fazer login';
      }
    });
  }

  protected loginWithProvider(provider: 'Google' | 'Apple' | 'Microsoft'): void {
    this.error = `Login com ${provider} ainda precisa ser conectado no backend.`;
  }
}
