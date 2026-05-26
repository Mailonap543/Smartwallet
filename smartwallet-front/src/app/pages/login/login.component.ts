import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, SocialAuthProvider } from '../../services/auth.service';

interface LoginFeature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="auth-shell login-screen">
      <div class="circuit-layer" aria-hidden="true"></div>
      <div class="particle-field" aria-hidden="true"></div>

      <div class="status-pill">
        <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">verified_user</span>
        Conectado e Seguro
        <i aria-hidden="true"></i>
      </div>

      <section class="login-panel">
        <div class="brand" aria-label="Smartwallet">
          <span class="brand-mark" aria-hidden="true">W</span>
          <span class="brand-name">Smart<strong>wallet</strong></span>
        </div>

        <header class="auth-copy">
          <h1>Bem-vindo de <span>volta!</span></h1>
          <p>Acesse sua conta e continue investindo no seu futuro.</p>
        </header>

        <form class="auth-form" (ngSubmit)="onSubmit()" novalidate>
          <label class="field">
            <span>E-mail</span>
            <div class="input-shell" [class.valid]="email">
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">mail</span>
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                placeholder="seu@email.com"
                autocomplete="email"
                required
              />
              <span class="material-symbols-rounded check-icon notranslate" translate="no" aria-hidden="true">check_circle</span>
            </div>
          </label>

          <label class="field">
            <span>Senha</span>
            <div class="input-shell">
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">lock</span>
              <input
                [type]="showPassword ? 'text' : 'password'"
                [(ngModel)]="password"
                name="password"
                placeholder="••••••••"
                autocomplete="current-password"
                required
              />
              <button class="icon-button" type="button" (click)="showPassword = !showPassword" aria-label="Mostrar ou ocultar senha">
                <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">{{ showPassword ? 'visibility' : 'visibility_off' }}</span>
              </button>
            </div>
          </label>

          <div class="form-options">
            <label class="remember">
              <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe" />
              <span>Lembrar de mim</span>
            </label>
            <button type="button" class="forgot-link" (click)="showPasswordHelp()">Esqueci minha senha</button>
          </div>

          @if (error) {
            <p class="form-alert error">{{ error }}</p>
          }

          @if (notice) {
            <p class="form-alert info">{{ notice }}</p>
          }

          <button class="primary-action" type="submit" [disabled]="auth.isLoading()">
            <span>{{ auth.isLoading() ? 'Entrando...' : 'Entrar na minha conta' }}</span>
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">arrow_forward</span>
          </button>
        </form>

        <div class="divider"><span>ou continue com</span></div>

        <div class="social-grid" aria-label="Métodos de login social">
          <button type="button" (click)="loginWithProvider('Google')" aria-label="Entrar com Google">
            <span class="google-logo">G</span>
            Google
          </button>
          <button type="button" (click)="loginWithProvider('Apple')" aria-label="Entrar com Apple">
            <span class="material-symbols-rounded notranslate apple-logo" translate="no" aria-hidden="true">nutrition</span>
            Apple
          </button>
          <button type="button" (click)="loginWithProvider('Microsoft')" aria-label="Entrar com Microsoft">
            <span class="microsoft-logo" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
            Microsoft
          </button>
        </div>

        <p class="switch-link">Ainda não tem uma conta? <a routerLink="/register">Criar conta</a></p>

        <section class="security-card">
          <div class="security-icon">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">verified_user</span>
          </div>
          <div>
            <h2>Sua segurança é nossa prioridade</h2>
            <p>Usamos criptografia de ponta e os mais altos padrões de segurança para proteger seus dados.</p>
          </div>
        </section>

        <p class="copyright">
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">lock</span>
          Smartwallet © 2024. Todos os direitos reservados.
        </p>
      </section>

      <section class="phone-stage" aria-hidden="true">
        <div class="phone">
          <div class="phone-status">
            <span>9:41</span>
            <span class="phone-dots"></span>
          </div>
          <div class="phone-notch"></div>

          <div class="phone-screen">
            <p>Patrimônio total</p>
            <strong>R$ 125.430,80</strong>
            <div class="gain-line">
              <span>+7,52%</span>
              <small>nos últimos 30 dias</small>
            </div>

            <div class="market-chart">
              <svg viewBox="0 0 320 150" role="img" aria-label="Gráfico de crescimento">
                <defs>
                  <linearGradient id="loginChartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#22f7b4" stop-opacity="0.58" />
                    <stop offset="100%" stop-color="#22f7b4" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <path class="chart-fill" d="M0 140 L18 118 L35 96 L52 112 L70 84 L88 101 L105 68 L123 88 L141 56 L158 72 L176 42 L194 65 L212 36 L230 48 L248 18 L266 30 L284 8 L304 28 L320 0 L320 150 L0 150 Z"></path>
                <path class="chart-line" d="M0 140 L18 118 L35 96 L52 112 L70 84 L88 101 L105 68 L123 88 L141 56 L158 72 L176 42 L194 65 L212 36 L230 48 L248 18 L266 30 L284 8 L304 28 L320 0"></path>
                <circle class="chart-dot" cx="320" cy="0" r="5"></circle>
              </svg>
              <span class="floating-gain">+7,52%</span>
            </div>

            <div class="phone-tabs">
              <span>1D</span>
              <span>1S</span>
              <strong>1M</strong>
              <span>3M</span>
              <span>1A</span>
              <span>TODOS</span>
            </div>

            <div class="distribution">
              <p>Distribuição</p>
              <div class="donut"></div>
              <ul>
                <li><i class="green"></i>Renda Fixa <b>40%</b></li>
                <li><i class="purple"></i>Ações <b>30%</b></li>
                <li><i class="blue"></i>FIIs <b>20%</b></li>
                <li><i class="yellow"></i>Internacional <b>10%</b></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="neon-platform"></div>
      </section>

      <section class="feature-band" aria-label="Recursos Smartwallet">
        @for (feature of features; track feature.title) {
          <article>
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">{{ feature.icon }}</span>
            <div>
              <h2>{{ feature.title }}</h2>
              <p>{{ feature.description }}</p>
            </div>
          </article>
        }
      </section>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      color: #fff;
      background: #02030d;
    }

    .auth-shell {
      position: relative;
      min-height: 100vh;
      overflow-x: hidden;
      overflow-y: auto;
      display: grid;
      grid-template-columns: minmax(430px, 560px) minmax(420px, 1fr);
      gap: clamp(24px, 5vw, 84px);
      align-items: start;
      padding: 88px clamp(24px, 6vw, 92px) 190px;
      background:
        radial-gradient(circle at 70% 36%, rgba(21, 245, 198, 0.16), transparent 24%),
        radial-gradient(circle at 84% 72%, rgba(105, 41, 255, 0.26), transparent 32%),
        radial-gradient(circle at 10% 92%, rgba(67, 56, 202, 0.28), transparent 28%),
        linear-gradient(135deg, #030411 0%, #050717 48%, #02030b 100%);
    }

    .circuit-layer,
    .particle-field {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .circuit-layer {
      opacity: 0.7;
      background:
        linear-gradient(90deg, transparent 0 7%, rgba(47, 219, 255, 0.09) 7.2% 7.35%, transparent 7.5% 100%),
        linear-gradient(120deg, transparent 0 62%, rgba(119, 65, 255, 0.18) 62.2% 62.4%, transparent 62.6%),
        linear-gradient(180deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
      background-size: auto, auto, 64px 64px, 64px 64px;
      mask-image: radial-gradient(circle at 70% 38%, #000 0 38%, transparent 75%);
    }

    .particle-field {
      background-image:
        radial-gradient(circle, rgba(34, 247, 180, 0.95) 0 1px, transparent 1.4px),
        radial-gradient(circle, rgba(125, 77, 255, 0.95) 0 1px, transparent 1.5px),
        radial-gradient(circle, rgba(0, 186, 255, 0.9) 0 1px, transparent 1.3px);
      background-position: 18% 22%, 64% 18%, 88% 54%;
      background-size: 220px 260px, 320px 300px, 260px 360px;
      animation: particleDrift 16s linear infinite;
    }

    .status-pill {
      position: absolute;
      top: 70px;
      right: clamp(24px, 7vw, 94px);
      z-index: 5;
      min-height: 56px;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 0 20px;
      border: 1px solid rgba(137, 116, 255, 0.36);
      border-radius: 16px;
      color: #c8cce2;
      background: rgba(7, 10, 30, 0.72);
      box-shadow: inset 0 0 22px rgba(105, 41, 255, 0.08);
      backdrop-filter: blur(14px);
      animation: fadeDown 650ms ease both 220ms;
    }

    .status-pill .material-symbols-rounded {
      color: #16f5aa;
      font-size: 25px;
    }

    .status-pill i {
      width: 11px;
      height: 11px;
      border-radius: 50%;
      background: #16f5aa;
      box-shadow: 0 0 18px rgba(22, 245, 170, 0.85);
    }

    .login-panel {
      position: relative;
      z-index: 2;
      display: grid;
      gap: 28px;
      animation: panelIn 720ms cubic-bezier(.2, .8, .2, 1) both;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 26px;
      width: max-content;
      color: #fff;
      font-size: clamp(42px, 4.4vw, 66px);
      font-weight: 900;
      line-height: 1;
      text-decoration: none;
      filter: drop-shadow(0 16px 38px rgba(0, 0, 0, 0.4));
      animation: brandPop 800ms cubic-bezier(.2, .95, .2, 1) both 80ms;
    }

    .brand strong,
    .auth-copy span,
    .switch-link a {
      color: #16d98e;
    }

    .brand-mark {
      width: 126px;
      height: 84px;
      display: grid;
      place-items: center;
      color: transparent;
      background: linear-gradient(135deg, #6f2cff 0%, #683cff 32%, #2dd8f0 62%, #18df98 100%);
      -webkit-background-clip: text;
      background-clip: text;
      font-family: "Arial Black", Inter, system-ui, sans-serif;
      font-size: 104px;
      font-weight: 900;
      line-height: 0.82;
      letter-spacing: 0;
      filter: drop-shadow(0 0 18px rgba(105, 41, 255, 0.5)) drop-shadow(0 0 22px rgba(22, 245, 170, 0.24));
      transform: skewX(-7deg);
      will-change: filter, transform;
      animation: logoPulse 3.8s ease-in-out infinite 900ms;
    }

    .brand-name {
      display: inline-block;
      text-shadow: 0 0 0 rgba(255, 255, 255, 0);
      will-change: filter, text-shadow, transform;
      animation: brandNameGlow 3.8s ease-in-out infinite 1s;
    }

    .brand:hover .brand-mark,
    .brand:hover .brand-name {
      animation-duration: 2.2s;
    }

    .auth-copy {
      animation: copyRise 720ms cubic-bezier(.16, .95, .3, 1) both 180ms;
    }

    h1,
    h2,
    p {
      margin: 0;
    }

    .auth-copy h1 {
      font-size: clamp(42px, 4vw, 58px);
      line-height: 1.08;
      letter-spacing: 0;
    }

    .auth-copy p {
      max-width: 430px;
      margin-top: 22px;
      color: #c6c8d8;
      font-size: 24px;
      line-height: 1.48;
    }

    .auth-form {
      display: grid;
      gap: 22px;
    }

    .field {
      display: grid;
      gap: 11px;
      color: #fff;
      font-size: 19px;
      font-weight: 800;
      animation: formItemIn 560ms cubic-bezier(.2, .85, .2, 1) both;
    }

    .field:nth-child(2) {
      animation-delay: 90ms;
    }

    .input-shell {
      min-height: 70px;
      display: grid;
      grid-template-columns: 34px minmax(0, 1fr) 38px;
      align-items: center;
      gap: 16px;
      padding: 0 22px;
      border: 1px solid rgba(136, 81, 255, 0.58);
      border-radius: 14px;
      background: linear-gradient(180deg, rgba(10, 14, 39, 0.88), rgba(5, 8, 28, 0.82));
      box-shadow: inset 0 0 32px rgba(105, 41, 255, 0.05);
      transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
    }

    .input-shell.valid,
    .input-shell:focus-within {
      border-color: #2af5cb;
      box-shadow: 0 0 0 3px rgba(42, 245, 203, 0.12), 0 0 32px rgba(42, 245, 203, 0.18);
    }

    .input-shell:focus-within {
      transform: translateY(-1px);
    }

    .input-shell > .material-symbols-rounded {
      color: #8d4dff;
      font-size: 31px;
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
      color: #c9cede;
    }

    input:focus {
      caret-color: #2af5cb;
    }

    .check-icon {
      color: #22f7b4 !important;
      opacity: 0;
      transform: scale(0.8);
      transition: opacity 160ms ease, transform 160ms ease;
    }

    .input-shell.valid .check-icon {
      opacity: 1;
      transform: scale(1);
    }

    .icon-button {
      width: 38px;
      height: 38px;
      display: grid;
      place-items: center;
      border: 0;
      color: #8d4dff;
      background: transparent;
      cursor: pointer;
    }

    .form-options {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      animation: formItemIn 560ms cubic-bezier(.2, .85, .2, 1) both 170ms;
    }

    .remember {
      display: inline-flex;
      align-items: center;
      gap: 11px;
      color: #c8cce2;
      font-size: 17px;
    }

    .remember input {
      width: 26px;
      height: 26px;
      accent-color: #6f35ff;
    }

    .forgot-link {
      border: 0;
      color: #8d4dff;
      background: transparent;
      font-size: 17px;
      font-weight: 800;
      cursor: pointer;
    }

    .primary-action {
      min-height: 78px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 42px;
      border: 0;
      border-radius: 14px;
      color: #fff;
      font-size: 25px;
      font-weight: 900;
      cursor: pointer;
      background: linear-gradient(100deg, #6d25ff 0%, #356dff 48%, #17d996 100%);
      box-shadow: 0 18px 50px rgba(23, 217, 150, 0.22), 0 0 42px rgba(109, 37, 255, 0.18);
      transition: transform 170ms ease, filter 170ms ease, box-shadow 170ms ease;
      animation: formItemIn 560ms cubic-bezier(.2, .85, .2, 1) both 260ms;
    }

    .primary-action:hover:not(:disabled) {
      transform: translateY(-3px);
      filter: saturate(1.18) brightness(1.05);
      box-shadow: 0 24px 70px rgba(23, 217, 150, 0.3), 0 0 52px rgba(109, 37, 255, 0.25);
    }

    .primary-action:disabled {
      cursor: wait;
      opacity: 0.68;
    }

    .form-alert {
      padding: 13px 15px;
      border-radius: 14px;
      font-weight: 750;
      line-height: 1.35;
    }

    .form-alert.error {
      border: 1px solid rgba(248, 113, 113, 0.36);
      color: #fecaca;
      background: rgba(127, 29, 29, 0.28);
    }

    .form-alert.info {
      border: 1px solid rgba(42, 245, 203, 0.26);
      color: #cdfcf2;
      background: rgba(14, 116, 144, 0.16);
    }

    .divider {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 18px;
      color: #bbbfd0;
      font-size: 17px;
    }

    .divider::before,
    .divider::after {
      height: 1px;
      content: '';
      background: rgba(190, 195, 214, 0.22);
    }

    .social-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }

    .social-grid button {
      min-height: 62px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 11px;
      border: 1px solid rgba(99, 114, 164, 0.42);
      border-radius: 12px;
      color: #fff;
      background: rgba(9, 13, 35, 0.78);
      font-size: 18px;
      font-weight: 850;
      cursor: pointer;
      transition: border-color 170ms ease, transform 170ms ease, box-shadow 170ms ease;
    }

    .social-grid button:hover {
      transform: translateY(-2px);
      border-color: rgba(42, 245, 203, 0.55);
      box-shadow: 0 14px 34px rgba(42, 245, 203, 0.11);
    }

    .google-logo {
      color: #4285f4;
      font-size: 28px;
      font-weight: 1000;
    }

    .apple-logo {
      color: #fff;
      font-size: 29px;
    }

    .microsoft-logo {
      width: 25px;
      height: 25px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3px;
    }

    .microsoft-logo i:nth-child(1) { background: #f25022; }
    .microsoft-logo i:nth-child(2) { background: #7fba00; }
    .microsoft-logo i:nth-child(3) { background: #00a4ef; }
    .microsoft-logo i:nth-child(4) { background: #ffb900; }

    .switch-link {
      color: #c5c9d8;
      font-size: 19px;
      text-align: center;
    }

    .switch-link a {
      font-weight: 900;
      text-decoration: none;
    }

    .security-card {
      width: min(100%, 520px);
      display: grid;
      grid-template-columns: 86px minmax(0, 1fr);
      gap: 22px;
      align-items: center;
      margin-top: 12px;
      padding: 28px;
      border: 1px solid rgba(91, 65, 255, 0.34);
      border-radius: 25px;
      background: linear-gradient(145deg, rgba(10, 16, 44, 0.76), rgba(6, 9, 30, 0.72));
      box-shadow: inset 0 0 36px rgba(22, 217, 150, 0.04);
      backdrop-filter: blur(18px);
    }

    .security-icon {
      width: 86px;
      height: 86px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #1df4a8;
      background: rgba(29, 244, 168, 0.13);
      box-shadow: 0 0 28px rgba(29, 244, 168, 0.16);
    }

    .security-icon .material-symbols-rounded {
      font-size: 48px;
    }

    .security-card h2 {
      font-size: 21px;
    }

    .security-card p {
      margin-top: 12px;
      color: #c8cce2;
      font-size: 17px;
      line-height: 1.5;
    }

    .copyright {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      margin-top: 88px;
      color: #c5c9d8;
      font-size: 15px;
    }

    .copyright .material-symbols-rounded {
      font-size: 18px;
    }

    .phone-stage {
      position: relative;
      z-index: 2;
      min-height: 780px;
      display: grid;
      place-items: center;
      padding-top: 110px;
      animation: phoneSlide 950ms cubic-bezier(.2, .88, .2, 1) both 180ms;
    }

    .phone {
      position: relative;
      z-index: 2;
      width: min(390px, 82vw);
      height: 650px;
      padding: 42px 27px 28px;
      border: 3px solid rgba(177, 197, 232, 0.72);
      border-radius: 54px;
      transform: rotate(-5.5deg);
      background: linear-gradient(155deg, #0b1732, #050917 72%);
      box-shadow: 0 45px 110px rgba(0, 0, 0, 0.52), 0 0 70px rgba(42, 245, 203, 0.15);
    }

    .phone::before {
      position: absolute;
      inset: 8px;
      border: 1px solid rgba(119, 156, 210, 0.28);
      border-radius: 46px;
      content: '';
      pointer-events: none;
    }

    .phone-notch {
      position: absolute;
      top: 20px;
      left: 50%;
      width: 130px;
      height: 28px;
      border-radius: 0 0 18px 18px;
      transform: translateX(-50%);
      background: #02030d;
    }

    .phone-status {
      position: absolute;
      top: 34px;
      left: 38px;
      right: 36px;
      display: flex;
      justify-content: space-between;
      color: #fff;
      font-size: 13px;
      font-weight: 900;
    }

    .phone-dots {
      width: 54px;
      height: 14px;
      border-radius: 999px;
      background:
        radial-gradient(circle at 8px 50%, #fff 0 3px, transparent 3.5px),
        radial-gradient(circle at 24px 50%, #fff 0 3px, transparent 3.5px),
        linear-gradient(90deg, #fff 0 38px, transparent 38px);
      opacity: 0.9;
    }

    .phone-screen {
      position: relative;
      z-index: 1;
      height: 100%;
      display: grid;
      align-content: start;
      color: #fff;
    }

    .phone-screen > p,
    .distribution p,
    .gain-line small {
      color: #c9cede;
      font-size: 16px;
    }

    .phone-screen strong {
      margin-top: 14px;
      font-size: 35px;
      line-height: 1;
    }

    .gain-line {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-top: 18px;
    }

    .gain-line span,
    .floating-gain {
      padding: 7px 10px;
      border-radius: 8px;
      color: #c7ffe9;
      font-size: 15px;
      font-weight: 900;
      background: rgba(21, 185, 124, 0.78);
      animation: gainPulse 1.8s ease-in-out infinite;
    }

    .market-chart {
      position: relative;
      height: 196px;
      margin-top: 30px;
      border-radius: 11px;
      overflow: hidden;
      background:
        linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
      background-size: 100% 38px, 58px 100%;
    }

    .market-chart svg {
      position: absolute;
      inset: 18px 0 0;
      width: 100%;
      height: 150px;
      overflow: visible;
      animation: chartFloat 3.4s ease-in-out infinite;
    }

    .chart-fill {
      fill: url(#loginChartGlow);
      opacity: 0;
      animation: fadeIn 700ms ease both 950ms;
    }

    .chart-line {
      fill: none;
      stroke: #22f7b4;
      stroke-width: 4;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-dasharray: 640;
      stroke-dashoffset: 640;
      filter: drop-shadow(0 0 12px rgba(34, 247, 180, 0.65));
      animation: drawLine 1.4s ease both 720ms;
    }

    .chart-dot {
      fill: #d8fff2;
      filter: drop-shadow(0 0 12px rgba(34, 247, 180, 0.9));
      opacity: 0;
      animation: fadeIn 400ms ease both 1.65s;
    }

    .floating-gain {
      position: absolute;
      right: 5px;
      bottom: 70px;
      background: rgba(3, 37, 50, 0.92);
    }

    .phone-tabs {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
      margin: 10px 0 28px;
      color: #aeb5d8;
      font-size: 13px;
      text-align: center;
    }

    .phone-tabs strong {
      margin: 0;
      padding: 8px 0;
      border-radius: 999px;
      color: #fff;
      font-size: 13px;
      background: rgba(93, 111, 151, 0.32);
    }

    .distribution {
      position: relative;
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 18px;
      align-items: center;
      padding: 18px 0 0;
      border-top: 1px solid rgba(255,255,255,0.06);
    }

    .distribution p {
      grid-column: 1 / -1;
    }

    .donut {
      width: 112px;
      height: 112px;
      border-radius: 50%;
      background: conic-gradient(#19d98c 0 40%, #5828ff 40% 70%, #0c66ff 70% 90%, #ffb31a 90% 100%);
      box-shadow: inset 0 0 0 34px #081126, 0 0 28px rgba(105, 41, 255, 0.2);
    }

    .distribution ul {
      display: grid;
      gap: 12px;
      margin: 0;
      padding: 0;
      list-style: none;
      color: #c9cede;
      font-size: 13px;
    }

    .distribution li {
      display: grid;
      grid-template-columns: 10px 1fr auto;
      align-items: center;
      gap: 8px;
    }

    .distribution i {
      width: 9px;
      height: 9px;
      border-radius: 50%;
    }

    .distribution .green { background: #19d98c; }
    .distribution .purple { background: #5828ff; }
    .distribution .blue { background: #0c66ff; }
    .distribution .yellow { background: #ffb31a; }
    .distribution b { color: #fff; }

    .neon-platform {
      position: absolute;
      bottom: 40px;
      width: min(650px, 92vw);
      height: 150px;
      border: 1px solid rgba(42, 245, 203, 0.6);
      border-radius: 50%;
      transform: perspective(520px) rotateX(62deg);
      background:
        radial-gradient(circle, rgba(255, 255, 255, 0.8) 0 2%, rgba(105, 41, 255, 0.55) 3% 10%, transparent 11%),
        repeating-radial-gradient(circle, rgba(42, 245, 203, 0.65) 0 2px, transparent 2px 34px);
      box-shadow: 0 0 65px rgba(105, 41, 255, 0.52), inset 0 0 55px rgba(42, 245, 203, 0.22);
      animation: platformIgnite 1.3s ease both 500ms;
    }

    .feature-band {
      position: absolute;
      left: clamp(24px, 5vw, 64px);
      right: clamp(24px, 5vw, 64px);
      bottom: 52px;
      z-index: 3;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      padding: 28px 32px;
      border: 1px solid rgba(42, 245, 203, 0.5);
      border-radius: 26px;
      background: linear-gradient(145deg, rgba(9, 13, 35, 0.85), rgba(5, 8, 28, 0.78));
      box-shadow: 0 0 50px rgba(105, 41, 255, 0.18), inset 0 0 36px rgba(42, 245, 203, 0.04);
      backdrop-filter: blur(18px);
      animation: fadeUp 720ms ease both 700ms;
    }

    .feature-band article {
      display: grid;
      grid-template-columns: 64px minmax(0, 1fr);
      gap: 16px;
      align-items: start;
      transition: transform 170ms ease;
    }

    .feature-band article:hover {
      transform: translateY(-3px);
    }

    .feature-band article > .material-symbols-rounded {
      width: 58px;
      height: 58px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #22f7b4;
      font-size: 33px;
      background: radial-gradient(circle, rgba(42, 245, 203, 0.18), rgba(105, 41, 255, 0.24));
      box-shadow: 0 0 30px rgba(105, 41, 255, 0.18);
    }

    .feature-band h2 {
      font-size: 17px;
      line-height: 1.25;
    }

    .feature-band p {
      margin-top: 10px;
      color: #b9bfd4;
      font-size: 14px;
      line-height: 1.45;
    }

    @keyframes particleDrift {
      to { background-position: 18% 120%, 64% 118%, 88% 154%; }
    }

    @keyframes brandPop {
      from { opacity: 0; transform: scale(1.1); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes logoPulse {
      0%, 100% {
        transform: skewX(-7deg) translateY(0) scale(1);
        filter: drop-shadow(0 0 18px rgba(105, 41, 255, 0.46)) drop-shadow(0 0 20px rgba(22, 245, 170, 0.2));
      }

      46% {
        transform: skewX(-7deg) translateY(-4px) scale(1.035);
        filter: drop-shadow(0 0 28px rgba(105, 41, 255, 0.72)) drop-shadow(0 0 34px rgba(22, 245, 170, 0.42));
      }
    }

    @keyframes brandNameGlow {
      0%, 100% {
        transform: translateY(0);
        filter: brightness(1);
        text-shadow: 0 0 0 rgba(22, 245, 170, 0);
      }

      46% {
        transform: translateY(-1px);
        filter: brightness(1.14);
        text-shadow: 0 0 22px rgba(22, 245, 170, 0.22), 0 0 34px rgba(105, 41, 255, 0.18);
      }
    }

    @keyframes panelIn {
      from { opacity: 0; transform: translateX(-34px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes copyRise {
      from { opacity: 0; transform: translateY(50px); }
      75% { transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes formItemIn {
      from { opacity: 0; transform: translateY(18px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes phoneSlide {
      from { opacity: 0; transform: translateX(96px) scale(0.96); }
      to { opacity: 1; transform: translateX(0) scale(1); }
    }

    @keyframes fadeDown {
      from { opacity: 0; transform: translateY(-14px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(22px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeIn {
      to { opacity: 1; }
    }

    @keyframes drawLine {
      to { stroke-dashoffset: 0; }
    }

    @keyframes chartFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    @keyframes gainPulse {
      0%, 100% { box-shadow: 0 0 0 rgba(29, 244, 168, 0); }
      50% { box-shadow: 0 0 24px rgba(29, 244, 168, 0.36); }
    }

    @keyframes platformIgnite {
      from { opacity: 0; filter: brightness(0.4); }
      to { opacity: 1; filter: brightness(1); }
    }

    @media (max-width: 1180px) {
      .auth-shell {
        grid-template-columns: 1fr;
        padding-bottom: 360px;
      }

      .phone-stage {
        min-height: 720px;
        padding-top: 28px;
      }

      .status-pill {
        position: relative;
        top: auto;
        right: auto;
        justify-self: end;
        grid-column: 1;
        grid-row: 1;
      }

      .login-panel {
        grid-row: 2;
      }
    }

    @media (max-width: 900px) {
      .auth-shell {
        padding: 38px 18px 34px;
      }

      .phone-stage,
      .feature-band {
        position: relative;
        inset: auto;
      }

      .feature-band {
        grid-template-columns: 1fr;
        margin-top: 24px;
      }

      .copyright {
        margin-top: 28px;
      }
    }

    @media (max-width: 620px) {
      .brand {
        gap: 14px;
        font-size: 38px;
      }

      .brand-mark {
        width: 82px;
        height: 62px;
        font-size: 72px;
      }

      .auth-copy h1 {
        font-size: 38px;
      }

      .auth-copy p,
      input {
        font-size: 17px;
      }

      .social-grid,
      .security-card {
        grid-template-columns: 1fr;
      }

      .form-options {
        align-items: start;
        flex-direction: column;
      }

      .primary-action {
        min-height: 66px;
        gap: 16px;
        font-size: 20px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 1ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 1ms !important;
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
  protected notice = '';
  protected showPassword = false;
  protected rememberMe = true;

  protected readonly features: LoginFeature[] = [
    {
      icon: 'query_stats',
      title: 'Investimentos inteligentes',
      description: 'Análises avançadas com IA para melhores decisões.'
    },
    {
      icon: 'account_tree',
      title: 'Diversificação simplificada',
      description: 'Monte sua carteira balanceada com facilidade.'
    },
    {
      icon: 'schedule',
      title: 'Acompanhamento em tempo real',
      description: 'Monitore seus investimentos a qualquer momento.'
    },
    {
      icon: 'support_agent',
      title: 'Suporte especializado',
      description: 'Nossa equipe está pronta para te ajudar.'
    }
  ];

  protected onSubmit(): void {
    this.error = '';
    this.notice = '';

    if (!this.email || !this.password) {
      this.error = 'Informe seu e-mail e senha para entrar.';
      return;
    }

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        void this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = this.getLoginErrorMessage(err);
      }
    });
  }

  protected loginWithProvider(provider: SocialAuthProvider): void {
    this.error = '';
    this.notice = '';

    const redirected = this.auth.loginWithProvider(provider);
    if (!redirected) {
      this.notice = `${provider} ainda não está configurado neste ambiente. Use e-mail e senha por enquanto.`;
    }
  }

  protected showPasswordHelp(): void {
    this.error = '';
    this.notice = this.email
      ? 'A recuperação por e-mail será enviada quando o fluxo de redefinição estiver ligado no front.'
      : 'Digite seu e-mail primeiro para recuperar a senha.';
  }

  private getLoginErrorMessage(err: any): string {
    if (err?.status === 0) {
      return 'Não foi possível conectar ao servidor. Inicie o backend na porta 8080 e tente novamente.';
    }

    if (err?.status === 401 || err?.status === 403) {
      return 'E-mail ou senha inválidos.';
    }

    return err?.error?.message || err?.message || 'Erro ao fazer login';
  }
}
