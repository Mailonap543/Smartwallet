import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, SocialAuthProvider } from '../../services/auth.service';

interface BenefitCard {
  icon: string;
  title: string;
  description: string;
}

interface SecurityItem {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="register-shell">
      <div class="circuit-layer" aria-hidden="true"></div>
      <div class="particle-field" aria-hidden="true"></div>

      <a class="back-link" routerLink="/login" aria-label="Voltar para o login">
        <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">arrow_back</span>
        Voltar para o login
      </a>

      <div class="status-pill">
        <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">verified_user</span>
        Conexão segura
        <i aria-hidden="true"></i>
      </div>

      <section class="register-panel">
        <div class="brand" aria-label="Smartwallet">
          <span class="brand-mark" aria-hidden="true">W</span>
          <span class="brand-name">Smart<strong>wallet</strong></span>
        </div>

        <header class="auth-copy">
          <h1>Criar sua <span>conta</span></h1>
          <p>Junte-se à nova geração de investidores e comece a construir seu futuro hoje.</p>
        </header>

        <nav class="stepper" aria-label="Etapas do cadastro">
          <span class="step active"><i>1</i><b>Dados pessoais</b></span>
          <span class="step"><i>2</i><b>Verificação</b></span>
          <span class="step"><i>3</i><b>Concluído</b></span>
        </nav>

        <form class="auth-form" (ngSubmit)="onSubmit()" autocomplete="off" novalidate>
          <label class="field">
            <span>Nome completo</span>
            <div class="input-shell">
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">person</span>
              <input
                type="text"
                [(ngModel)]="fullName"
                name="fullName"
                placeholder="Digite seu nome completo"
                autocomplete="name"
                required
              />
            </div>
          </label>

          <label class="field">
            <span>E-mail</span>
            <div class="input-shell">
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">mail</span>
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                placeholder="Digite seu melhor e-mail"
                autocomplete="email"
                required
              />
            </div>
          </label>

          <div class="split-fields">
            <label class="field">
              <span>CPF</span>
              <div class="input-shell compact">
                <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">badge</span>
                <input
                  type="text"
                  [(ngModel)]="cpf"
                  name="cpf"
                  placeholder="000.000.000-00"
                  inputmode="numeric"
                  maxlength="14"
                  autocomplete="off"
                  required
                />
              </div>
            </label>

            <label class="field">
              <span>Telefone</span>
              <div class="input-shell compact">
                <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">call</span>
                <input
                  type="tel"
                  [(ngModel)]="phone"
                  name="phone"
                  placeholder="(11) 99999-9999"
                  inputmode="tel"
                  maxlength="16"
                  autocomplete="tel"
                  required
                />
              </div>
            </label>
          </div>

          <label class="field">
            <span>Senha</span>
            <div class="input-shell">
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">lock</span>
              <input
                [type]="showPassword ? 'text' : 'password'"
                [(ngModel)]="password"
                name="password"
                placeholder="Crie uma senha forte"
                autocomplete="new-password"
                required
              />
              <button class="icon-button" type="button" (click)="showPassword = !showPassword" aria-label="Mostrar ou ocultar senha">
                <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">{{ showPassword ? 'visibility' : 'visibility_off' }}</span>
              </button>
            </div>
            <div class="password-strength">
              <small>Força da senha: <b>{{ passwordStrengthLabel }}</b></small>
              <span class="strength-bars">
                @for (bar of strengthBars; track bar) {
                  <i [class.active]="bar <= passwordStrength"></i>
                }
              </span>
            </div>
          </label>

          <label class="field">
            <span>Confirmar senha</span>
            <div class="input-shell">
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">lock</span>
              <input
                [type]="showConfirmPassword ? 'text' : 'password'"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                placeholder="Confirme sua senha"
                autocomplete="new-password"
                required
              />
              <button class="icon-button" type="button" (click)="showConfirmPassword = !showConfirmPassword" aria-label="Mostrar ou ocultar confirmação de senha">
                <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">{{ showConfirmPassword ? 'visibility' : 'visibility_off' }}</span>
              </button>
            </div>
          </label>

          <label class="field">
            <span>Data de nascimento</span>
            <div class="input-shell compact">
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">calendar_month</span>
              <input
                type="text"
                [(ngModel)]="birthDate"
                name="birthDate"
                placeholder="DD / MM / AAAA"
                autocomplete="bday"
                required
              />
            </div>
          </label>

          <label class="terms">
            <input type="checkbox" [(ngModel)]="acceptedTerms" name="acceptedTerms" />
            <span>Eu li e concordo com os <a routerLink="/register">Termos de Uso</a> e a <a routerLink="/register">Política de Privacidade</a>.</span>
          </label>

          @if (error) {
            <p class="form-alert error">{{ error }}</p>
          }

          @if (notice) {
            <p class="form-alert info">{{ notice }}</p>
          }

          <button class="primary-action" type="submit" [disabled]="auth.isLoading()">
            <span>{{ auth.isLoading() ? 'Criando conta...' : 'Criar minha conta' }}</span>
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">arrow_forward</span>
          </button>
        </form>

        <div class="divider"><span>ou cadastre-se com</span></div>

        <div class="social-grid" aria-label="Métodos de cadastro social">
          <button type="button" (click)="registerWithProvider('Google')" aria-label="Cadastrar com Google">
            <span class="google-logo">G</span>
            Google
          </button>
          <button type="button" (click)="registerWithProvider('Apple')" aria-label="Cadastrar com Apple">
            <span class="material-symbols-rounded notranslate apple-logo" translate="no" aria-hidden="true">nutrition</span>
            Apple
          </button>
          <button type="button" (click)="registerWithProvider('Microsoft')" aria-label="Cadastrar com Microsoft">
            <span class="microsoft-logo" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
            Microsoft
          </button>
        </div>

        <section class="data-protection">
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">verified_user</span>
          <div>
            <h2>Seus dados estão protegidos</h2>
            <p>Usamos criptografia de ponta e os mais altos padrões de segurança.</p>
          </div>
        </section>
      </section>

      <section class="hero-column" aria-hidden="true">
        <div class="hero-orbit">
          <span class="hero-brand" aria-hidden="true">W</span>
          <div class="ring ring-one"></div>
          <div class="ring ring-two"></div>
          <div class="ring ring-three"></div>
        </div>
        <div class="hero-platform"></div>

        <section class="benefit-box">
          <p>Ao criar sua conta, você terá acesso a:</p>
          @for (card of benefitCards; track card.title) {
            <article>
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">{{ card.icon }}</span>
              <div>
                <h2>{{ card.title }}</h2>
                <p>{{ card.description }}</p>
              </div>
            </article>
          }
        </section>

        <section class="stats-box">
          <div>
            <strong>+25K</strong>
            <span>Usuários ativos</span>
          </div>
          <div>
            <strong>R$ 2.8B</strong>
            <span>Em investimentos</span>
          </div>
          <div>
            <strong>98.7%</strong>
            <span>Satisfação</span>
          </div>
          <p>
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">lock</span>
            Regulado e em conformidade com as leis brasileiras.
          </p>
        </section>
      </section>

      <section class="security-rail" aria-label="Segurança">
        @for (item of securityItems; track item.title) {
          <article>
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">{{ item.icon }}</span>
            <div>
              <h2>{{ item.title }}</h2>
              <p>{{ item.description }}</p>
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

    .register-shell {
      position: relative;
      min-height: 100vh;
      overflow-x: hidden;
      overflow-y: auto;
      display: grid;
      grid-template-columns: minmax(430px, 560px) minmax(420px, 1fr);
      gap: clamp(30px, 6vw, 86px);
      align-items: start;
      padding: 88px clamp(24px, 6vw, 78px) 150px;
      background:
        radial-gradient(circle at 73% 25%, rgba(105, 41, 255, 0.26), transparent 27%),
        radial-gradient(circle at 82% 57%, rgba(21, 245, 198, 0.18), transparent 24%),
        radial-gradient(circle at 14% 91%, rgba(60, 46, 190, 0.26), transparent 30%),
        linear-gradient(135deg, #030411 0%, #060818 50%, #02030b 100%);
    }

    .circuit-layer,
    .particle-field {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .circuit-layer {
      opacity: 0.82;
      background:
        repeating-radial-gradient(circle at 76% 28%, rgba(102, 87, 255, 0.24) 0 1px, transparent 2px 18px),
        linear-gradient(90deg, transparent 0 52%, rgba(35, 202, 255, 0.12) 52.15% 52.35%, transparent 52.5%),
        linear-gradient(180deg, rgba(255,255,255,0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px);
      background-size: auto, auto, 68px 68px, 68px 68px;
      mask-image: radial-gradient(circle at 72% 31%, #000 0 42%, transparent 78%);
    }

    .particle-field {
      background-image:
        radial-gradient(circle, rgba(34, 247, 180, 0.96) 0 1px, transparent 1.4px),
        radial-gradient(circle, rgba(125, 77, 255, 0.96) 0 1px, transparent 1.4px),
        radial-gradient(circle, rgba(0, 186, 255, 0.9) 0 1px, transparent 1.3px);
      background-position: 74% 12%, 55% 34%, 90% 55%;
      background-size: 230px 260px, 320px 300px, 260px 360px;
      animation: particleDrift 16s linear infinite;
    }

    .back-link,
    .status-pill {
      position: absolute;
      top: 34px;
      z-index: 5;
      min-height: 48px;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      border: 1px solid rgba(91, 101, 151, 0.42);
      border-radius: 13px;
      color: #c8cce2;
      background: rgba(7, 10, 30, 0.72);
      text-decoration: none;
      backdrop-filter: blur(14px);
      animation: fadeDown 650ms ease both;
    }

    .back-link {
      left: clamp(24px, 5vw, 54px);
      padding: 0 18px;
      font-size: 18px;
    }

    .status-pill {
      right: clamp(24px, 5vw, 54px);
      padding: 0 18px;
      font-size: 15px;
    }

    .back-link .material-symbols-rounded,
    .status-pill .material-symbols-rounded {
      color: #23f4b1;
      font-size: 24px;
    }

    .status-pill i {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #23f4b1;
      box-shadow: 0 0 18px rgba(35, 244, 177, 0.9);
    }

    .register-panel {
      position: relative;
      z-index: 2;
      display: grid;
      gap: 26px;
      animation: unfoldIn 720ms cubic-bezier(.2, .85, .2, 1) both;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 26px;
      width: max-content;
      color: #fff;
      font-size: clamp(46px, 4.8vw, 68px);
      font-weight: 900;
      line-height: 1;
      text-decoration: none;
      animation: brandPop 780ms cubic-bezier(.2, .95, .2, 1) both 70ms;
    }

    .brand strong,
    .auth-copy span,
    .terms a {
      color: #16d98e;
    }

    .brand-mark,
    .hero-brand {
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
    }

    .brand-mark {
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

    h1,
    h2,
    p {
      margin: 0;
    }

    .auth-copy {
      animation: copyRise 720ms cubic-bezier(.16, .95, .3, 1) both 160ms;
    }

    .auth-copy h1 {
      font-size: clamp(42px, 4.5vw, 60px);
      line-height: 1.08;
      letter-spacing: 0;
    }

    .auth-copy p {
      max-width: 430px;
      margin-top: 18px;
      color: #c6c8d8;
      font-size: 22px;
      line-height: 1.48;
    }

    .stepper {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 22px;
      margin: 20px 0 10px;
      color: #aeb4cc;
    }

    .step {
      position: relative;
      display: grid;
      justify-items: center;
      gap: 10px;
    }

    .step:not(:last-child)::after {
      position: absolute;
      top: 20px;
      left: calc(50% + 32px);
      width: calc(100% - 42px);
      height: 1px;
      content: '';
      background: linear-gradient(90deg, rgba(35, 244, 177, 0.8), rgba(148, 163, 184, 0.28));
    }

    .step i {
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      border: 1px solid rgba(148, 163, 184, 0.48);
      border-radius: 50%;
      color: #c8cce2;
      font-style: normal;
      font-weight: 900;
      background: rgba(7, 10, 30, 0.76);
    }

    .step.active i {
      border-color: #23f4b1;
      color: #23f4b1;
      box-shadow: 0 0 0 5px rgba(35, 244, 177, 0.1), 0 0 28px rgba(35, 244, 177, 0.26);
      animation: stepPulse 1.7s ease-in-out infinite;
    }

    .step b {
      font-size: 14px;
      font-weight: 700;
    }

    .auth-form {
      display: grid;
      gap: 18px;
    }

    .split-fields {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    .field {
      display: grid;
      gap: 10px;
      color: #fff;
      font-size: 18px;
      font-weight: 820;
      animation: formItemIn 560ms cubic-bezier(.2, .85, .2, 1) both;
    }

    .field:nth-child(2) { animation-delay: 80ms; }
    .field:nth-child(3) { animation-delay: 160ms; }
    .field:nth-child(4) { animation-delay: 240ms; }
    .field:nth-child(5) { animation-delay: 320ms; }

    .input-shell {
      min-height: 60px;
      display: grid;
      grid-template-columns: 34px minmax(0, 1fr) 38px;
      align-items: center;
      gap: 16px;
      padding: 0 20px;
      border: 1px solid rgba(91, 101, 151, 0.62);
      border-radius: 11px;
      background: linear-gradient(180deg, rgba(10, 14, 39, 0.88), rgba(5, 8, 28, 0.82));
      transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
    }

    .input-shell.compact {
      grid-template-columns: 34px minmax(0, 1fr);
    }

    .input-shell:focus-within {
      transform: translateY(-1px);
      border-color: #8c4dff;
      box-shadow: 0 0 0 3px rgba(140, 77, 255, 0.13), 0 0 32px rgba(140, 77, 255, 0.15);
    }

    .input-shell > .material-symbols-rounded {
      color: #8d4dff;
      font-size: 29px;
    }

    input {
      width: 100%;
      border: 0;
      outline: 0;
      color: #fff;
      background: transparent;
      font-size: 17px;
    }

    input::placeholder {
      color: #9da4ba;
    }

    input:focus {
      caret-color: #23f4b1;
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

    .password-strength {
      display: grid;
      gap: 8px;
    }

    .password-strength small {
      color: #c8cce2;
      font-size: 13px;
    }

    .password-strength b {
      color: #23f4b1;
    }

    .strength-bars {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 4px;
    }

    .strength-bars i {
      height: 6px;
      border-radius: 999px;
      background: rgba(91, 101, 151, 0.4);
      transition: background 160ms ease, box-shadow 160ms ease;
    }

    .strength-bars i.active:nth-child(1) { background: #6d25ff; }
    .strength-bars i.active:nth-child(2) { background: #4c63ff; }
    .strength-bars i.active:nth-child(3) { background: #2288e8; }
    .strength-bars i.active:nth-child(4) { background: #15c2af; }
    .strength-bars i.active:nth-child(5) { background: #23f4b1; box-shadow: 0 0 16px rgba(35, 244, 177, 0.34); }

    .terms {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      color: #c8cce2;
      font-size: 15px;
      line-height: 1.35;
    }

    .terms input {
      width: 23px;
      height: 23px;
      flex: 0 0 auto;
      margin-top: 1px;
      accent-color: #6d25ff;
    }

    .terms a {
      text-decoration: none;
      font-weight: 850;
    }

    .primary-action {
      min-height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 46px;
      border: 0;
      border-radius: 12px;
      color: #fff;
      font-size: 24px;
      font-weight: 900;
      cursor: pointer;
      background: linear-gradient(100deg, #6d25ff 0%, #356dff 48%, #17d996 100%);
      box-shadow: 0 18px 50px rgba(23, 217, 150, 0.22), 0 0 42px rgba(109, 37, 255, 0.18);
      transition: transform 170ms ease, filter 170ms ease, box-shadow 170ms ease;
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
      font-size: 16px;
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
      min-height: 57px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 11px;
      border: 1px solid rgba(99, 114, 164, 0.42);
      border-radius: 10px;
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
      font-size: 27px;
      font-weight: 1000;
    }

    .apple-logo {
      color: #fff;
      font-size: 28px;
    }

    .microsoft-logo {
      width: 24px;
      height: 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3px;
    }

    .microsoft-logo i:nth-child(1) { background: #f25022; }
    .microsoft-logo i:nth-child(2) { background: #7fba00; }
    .microsoft-logo i:nth-child(3) { background: #00a4ef; }
    .microsoft-logo i:nth-child(4) { background: #ffb900; }

    .data-protection {
      display: grid;
      grid-template-columns: 72px minmax(0, 1fr);
      gap: 18px;
      align-items: center;
      margin-top: 2px;
    }

    .data-protection > .material-symbols-rounded {
      width: 68px;
      height: 68px;
      display: grid;
      place-items: center;
      border: 1px solid rgba(140, 77, 255, 0.65);
      border-radius: 50%;
      color: #8d4dff;
      font-size: 38px;
      background: rgba(140, 77, 255, 0.13);
    }

    .data-protection h2 {
      font-size: 18px;
    }

    .data-protection p {
      margin-top: 7px;
      color: #c8cce2;
      font-size: 14px;
      line-height: 1.45;
    }

    .hero-column {
      position: relative;
      z-index: 2;
      display: grid;
      gap: 30px;
      justify-items: center;
      padding-top: 12px;
      animation: unfoldHero 780ms cubic-bezier(.2, .85, .2, 1) both 120ms;
    }

    .hero-orbit {
      position: relative;
      width: min(480px, 88vw);
      height: 460px;
      display: grid;
      place-items: center;
    }

    .hero-brand {
      z-index: 4;
      width: 190px;
      height: 130px;
      font-size: 154px;
      filter: drop-shadow(0 0 34px rgba(35, 244, 177, 0.22));
      animation: heroBrandPulse 5.4s ease-in-out infinite;
    }

    .ring {
      position: absolute;
      border-radius: 50%;
      border: 1px solid rgba(95, 105, 255, 0.52);
      box-shadow: inset 0 0 28px rgba(35, 244, 177, 0.08), 0 0 32px rgba(109, 37, 255, 0.2);
      animation: spin 16s linear infinite;
    }

    .ring-one {
      width: 320px;
      height: 320px;
      border-color: rgba(109, 37, 255, 0.74);
    }

    .ring-two {
      width: 390px;
      height: 390px;
      border-style: dashed;
      animation-direction: reverse;
      animation-duration: 22s;
    }

    .ring-three {
      width: 455px;
      height: 455px;
      border-color: rgba(35, 244, 177, 0.42);
      animation-duration: 28s;
    }

    .hero-orbit::before {
      position: absolute;
      left: 50%;
      top: 8px;
      bottom: -50px;
      width: 2px;
      content: '';
      transform: translateX(-50%);
      background: linear-gradient(transparent, rgba(125, 77, 255, 0.85), rgba(35, 244, 177, 0.7), transparent);
      box-shadow: 0 0 28px rgba(125, 77, 255, 0.55);
    }

    .hero-platform {
      width: min(460px, 88vw);
      height: 110px;
      margin-top: -96px;
      border: 1px solid rgba(35, 244, 177, 0.68);
      border-radius: 50%;
      transform: perspective(460px) rotateX(64deg);
      background:
        radial-gradient(circle, rgba(255, 255, 255, 0.86) 0 2%, rgba(125, 77, 255, 0.55) 3% 12%, transparent 13%),
        repeating-radial-gradient(circle, rgba(35, 244, 177, 0.6) 0 2px, transparent 2px 30px);
      box-shadow: 0 0 60px rgba(35, 244, 177, 0.3), 0 0 80px rgba(125, 77, 255, 0.28);
      animation: platformIgnite 1.2s ease both 340ms;
    }

    .benefit-box,
    .stats-box {
      width: min(560px, 100%);
      border: 1px solid rgba(91, 101, 151, 0.42);
      border-radius: 27px;
      background: linear-gradient(145deg, rgba(10, 14, 39, 0.82), rgba(5, 8, 28, 0.78));
      box-shadow: inset 0 0 36px rgba(105, 41, 255, 0.05), 0 28px 80px rgba(0,0,0,0.24);
      backdrop-filter: blur(18px);
    }

    .benefit-box {
      display: grid;
      gap: 22px;
      padding: 28px;
    }

    .benefit-box > p {
      color: #c8cce2;
      font-size: 19px;
    }

    .benefit-box article {
      display: grid;
      grid-template-columns: 72px minmax(0, 1fr);
      gap: 20px;
      align-items: center;
      animation: cardBloom 680ms cubic-bezier(.2, .85, .2, 1) both;
    }

    .benefit-box article:nth-of-type(2) { animation-delay: 120ms; }
    .benefit-box article:nth-of-type(3) { animation-delay: 240ms; }
    .benefit-box article:nth-of-type(4) { animation-delay: 360ms; }

    .benefit-box article:hover > .material-symbols-rounded,
    .security-rail article:hover > .material-symbols-rounded {
      transform: translateY(-2px) scale(1.04);
      color: #23f4b1;
      box-shadow: 0 0 28px rgba(35, 244, 177, 0.24);
    }

    .benefit-box article > .material-symbols-rounded {
      width: 64px;
      height: 64px;
      display: grid;
      place-items: center;
      border: 1px solid rgba(140, 77, 255, 0.68);
      border-radius: 50%;
      color: #8d4dff;
      font-size: 36px;
      background: rgba(140, 77, 255, 0.12);
      transition: transform 170ms ease, color 170ms ease, box-shadow 170ms ease;
    }

    .benefit-box h2 {
      font-size: 19px;
    }

    .benefit-box article p {
      margin-top: 8px;
      color: #c8cce2;
      font-size: 16px;
      line-height: 1.42;
    }

    .stats-box {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0;
      padding: 30px;
      text-align: center;
      animation: fadeUp 720ms ease both 480ms;
    }

    .stats-box div:not(:last-of-type) {
      border-right: 1px solid rgba(190, 195, 214, 0.16);
    }

    .stats-box strong {
      display: block;
      font-size: 27px;
    }

    .stats-box span {
      display: block;
      margin-top: 10px;
      color: #c8cce2;
      font-size: 15px;
    }

    .stats-box > p {
      grid-column: 1 / -1;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      justify-content: center;
      margin-top: 26px;
      padding-top: 24px;
      border-top: 1px solid rgba(190, 195, 214, 0.18);
      color: #c8cce2;
      font-size: 15px;
    }

    .security-rail {
      position: relative;
      grid-column: 1 / -1;
      z-index: 3;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-top: 4px;
      padding: 24px 28px;
      border: 1px solid rgba(140, 77, 255, 0.48);
      border-radius: 7px;
      background: linear-gradient(145deg, rgba(9, 13, 35, 0.86), rgba(5, 8, 28, 0.8));
      box-shadow: 0 0 46px rgba(105, 41, 255, 0.18), inset 0 0 36px rgba(42, 245, 203, 0.04);
      backdrop-filter: blur(18px);
      animation: fadeUp 720ms ease both 660ms;
    }

    .security-rail article {
      display: grid;
      grid-template-columns: 54px minmax(0, 1fr);
      gap: 14px;
      align-items: start;
    }

    .security-rail article > .material-symbols-rounded {
      width: 46px;
      height: 46px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #8d4dff;
      font-size: 28px;
      background: rgba(140, 77, 255, 0.13);
      transition: transform 170ms ease, color 170ms ease, box-shadow 170ms ease;
    }

    .security-rail h2 {
      font-size: 14px;
    }

    .security-rail p {
      margin-top: 7px;
      color: #c8cce2;
      font-size: 13px;
      line-height: 1.38;
    }

    @keyframes particleDrift {
      to { background-position: 74% 110%, 55% 132%, 90% 155%; }
    }

    @keyframes unfoldIn {
      from { opacity: 0; transform: translateX(-52px) scale(0.96); }
      to { opacity: 1; transform: translateX(0) scale(1); }
    }

    @keyframes unfoldHero {
      from { opacity: 0; transform: translateX(80px) scale(0.96); }
      to { opacity: 1; transform: translateX(0) scale(1); }
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

    @keyframes copyRise {
      from { opacity: 0; transform: translateY(50px); }
      75% { transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes formItemIn {
      from { opacity: 0; transform: translateY(18px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes cardBloom {
      from { opacity: 0; transform: translateY(50px) scale(0.94); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes fadeDown {
      from { opacity: 0; transform: translateY(-14px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(22px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes heroFloat {
      0%, 100% { transform: translateY(0) rotate(-1deg); }
      50% { transform: translateY(-8px) rotate(1deg); }
    }

    @keyframes heroBrandPulse {
      0%, 100% {
        transform: skewX(-7deg) translateY(0) scale(1);
        filter: drop-shadow(0 0 30px rgba(35, 244, 177, 0.22)) drop-shadow(0 0 26px rgba(105, 41, 255, 0.26));
      }

      50% {
        transform: skewX(-7deg) translateY(-12px) scale(1.035);
        filter: drop-shadow(0 0 46px rgba(35, 244, 177, 0.38)) drop-shadow(0 0 44px rgba(105, 41, 255, 0.38));
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes platformIgnite {
      from { opacity: 0; filter: brightness(0.4); }
      to { opacity: 1; filter: brightness(1); }
    }

    @keyframes stepPulse {
      0%, 100% { box-shadow: 0 0 0 5px rgba(35, 244, 177, 0.1), 0 0 26px rgba(35, 244, 177, 0.22); }
      50% { box-shadow: 0 0 0 8px rgba(35, 244, 177, 0.16), 0 0 38px rgba(35, 244, 177, 0.32); }
    }

    @media (max-width: 1180px) {
      .register-shell {
        grid-template-columns: 1fr;
        padding-bottom: 340px;
      }

      .hero-column {
        padding-top: 0;
      }
    }

    @media (max-width: 900px) {
      .register-shell {
        padding: 92px 18px 34px;
      }

      .back-link,
      .status-pill,
      .security-rail {
        position: relative;
        inset: auto;
      }

      .status-pill {
        justify-self: end;
        margin-top: -62px;
      }

      .security-rail {
        grid-template-columns: 1fr;
        margin-top: 24px;
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
        font-size: 16px;
      }

      .stepper,
      .split-fields,
      .social-grid,
      .stats-box {
        grid-template-columns: 1fr;
      }

      .step:not(:last-child)::after,
      .stats-box div:not(:last-of-type) {
        display: none;
      }

      .primary-action {
        min-height: 66px;
        gap: 16px;
        font-size: 20px;
      }

      .hero-orbit {
        height: 330px;
        transform: scale(0.74);
      }

      .benefit-box article,
      .data-protection {
        grid-template-columns: 1fr;
        text-align: center;
        justify-items: center;
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
export class RegisterComponent {
  protected auth = inject(AuthService);
  private readonly router = inject(Router);

  protected fullName = '';
  protected email = '';
  protected cpf = '';
  protected phone = '';
  protected password = '';
  protected confirmPassword = '';
  protected birthDate = '';
  protected acceptedTerms = true;
  protected showPassword = false;
  protected showConfirmPassword = false;
  protected error = '';
  protected notice = '';
  protected readonly strengthBars = [1, 2, 3, 4, 5];

  protected readonly benefitCards: BenefitCard[] = [
    {
      icon: 'monitoring',
      title: 'Investimentos inteligentes',
      description: 'Análises avançadas com IA para melhores decisões.'
    },
    {
      icon: 'shield',
      title: 'Segurança máxima',
      description: 'Seus dados e investimentos protegidos com tecnologia de ponta.'
    },
    {
      icon: 'schedule',
      title: 'Acompanhamento em tempo real',
      description: 'Monitore seus investimentos e o mercado a qualquer momento.'
    },
    {
      icon: 'support_agent',
      title: 'Suporte especializado',
      description: 'Nossa equipe está pronta para te ajudar sempre que precisar.'
    }
  ];

  protected readonly securityItems: SecurityItem[] = [
    {
      icon: 'lock',
      title: 'Criptografia de ponta',
      description: 'Seus dados sempre protegidos.'
    },
    {
      icon: 'database',
      title: 'Dados 100% seguros',
      description: 'Armazenamento seguro e criptografado.'
    },
    {
      icon: 'verified_user',
      title: 'Conformidade LGPD',
      description: 'Total conformidade com a lei de proteção de dados.'
    },
    {
      icon: 'admin_panel_settings',
      title: 'Verificação em 2 etapas',
      description: 'Mais segurança para sua conta.'
    }
  ];

  protected get passwordStrength(): number {
    let score = 0;
    if (this.password.length >= 8) score++;
    if (/[A-Z]/.test(this.password)) score++;
    if (/[a-z]/.test(this.password)) score++;
    if (/\d/.test(this.password)) score++;
    if (/[^A-Za-z0-9]/.test(this.password) || this.password.length >= 12) score++;
    return score;
  }

  protected get passwordStrengthLabel(): string {
    if (!this.password) return 'Aguardando';
    if (this.passwordStrength <= 2) return 'Fraca';
    if (this.passwordStrength <= 3) return 'Boa';
    return 'Forte';
  }

  protected onSubmit(): void {
    this.error = '';
    this.notice = '';

    if (!this.fullName || !this.email || !this.cpf || !this.phone || !this.password || !this.confirmPassword || !this.birthDate) {
      this.error = 'Preencha todos os campos para criar sua conta.';
      return;
    }

    if (!this.acceptedTerms) {
      this.error = 'Aceite os termos para criar sua conta.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'As senhas não conferem.';
      return;
    }

    const onlyDigitsCpf = this.cpf.replace(/\D/g, '');
    if (onlyDigitsCpf.length !== 11) {
      this.error = 'O CPF deve ter 11 dígitos.';
      return;
    }

    const onlyDigitsPhone = this.phone.replace(/\D/g, '');
    if (onlyDigitsPhone.length < 10) {
      this.error = 'O telefone deve ter pelo menos 10 dígitos.';
      return;
    }

    if (this.password.length < 8) {
      this.error = 'A senha deve ter pelo menos 8 caracteres.';
      return;
    }

    this.auth.register({
      fullName: this.fullName.trim(),
      email: this.email.trim(),
      password: this.password,
      cpf: onlyDigitsCpf,
      phone: onlyDigitsPhone
    }).subscribe({
      next: () => {
        void this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Erro ao criar conta. Tente novamente.';
      }
    });
  }

  protected registerWithProvider(provider: SocialAuthProvider): void {
    this.error = '';
    this.notice = '';

    const redirected = this.auth.loginWithProvider(provider);
    if (!redirected) {
      this.notice = `${provider} ainda não está configurado neste ambiente. Cadastre-se com e-mail e senha por enquanto.`;
    }
  }

}
