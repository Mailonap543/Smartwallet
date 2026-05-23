import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div class="bg-gray-800 rounded-2xl shadow-lg px-10 py-10 w-full max-w-md">
        <h1 class="text-2xl font-black text-white mb-6 text-center">Criar Conta</h1>
        <form (ngSubmit)="onSubmit()" class="space-y-5" autocomplete="off">

          <div *ngIf="error()"
               class="w-full flex justify-center items-center mb-2 bg-red-600/40 rounded py-2 px-3 text-xs text-white font-bold">
            {{ error() }}
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Nome completo</label>
            <input
              type="text"
              [(ngModel)]="fullName"
              name="fullName"
              required
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">CPF</label>
            <input
              type="text"
              [(ngModel)]="cpf"
              name="cpf"
              required
              maxlength="14"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Apenas números"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Telefone</label>
            <input
              type="text"
              [(ngModel)]="phone"
              name="phone"
              required
              maxlength="15"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="DDD + número"
            />
          </div>

          <label class="field">
            <span>E-mail</span>
            <div class="input-shell">
              <span class="material-symbols-rounded" aria-hidden="true">mail</span>
              <input type="email" [(ngModel)]="email" name="email" placeholder="seu@email.com" autocomplete="email" required />
            </div>
          </label>

          <div class="split-fields">
            <label class="field">
              <span>CPF</span>
              <div class="input-shell compact">
                <span class="material-symbols-rounded" aria-hidden="true">badge</span>
                <input type="text" [(ngModel)]="cpf" name="cpf" placeholder="Apenas numeros" maxlength="14" required />
              </div>
            </label>

            <label class="field">
              <span>Telefone</span>
              <div class="input-shell compact">
                <span class="material-symbols-rounded" aria-hidden="true">call</span>
                <input type="text" [(ngModel)]="phone" name="phone" placeholder="DDD + numero" maxlength="15" required />
              </div>
            </label>
          </div>

          <label class="field">
            <span>Senha</span>
            <div class="input-shell">
              <span class="material-symbols-rounded" aria-hidden="true">lock</span>
              <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" placeholder="Crie uma senha" autocomplete="new-password" required />
              <button class="icon-button" type="button" (click)="showPassword = !showPassword" aria-label="Mostrar ou ocultar senha">
                <span class="material-symbols-rounded" aria-hidden="true">{{ showPassword ? 'visibility' : 'visibility_off' }}</span>
              </button>
            </div>
          </label>

          <label class="field">
            <span>Confirmar senha</span>
            <div class="input-shell">
              <span class="material-symbols-rounded" aria-hidden="true">lock</span>
              <input [type]="showConfirmPassword ? 'text' : 'password'" [(ngModel)]="confirmPassword" name="confirmPassword" placeholder="Confirme sua senha" autocomplete="new-password" required />
              <button class="icon-button" type="button" (click)="showConfirmPassword = !showConfirmPassword" aria-label="Mostrar ou ocultar confirmacao de senha">
                <span class="material-symbols-rounded" aria-hidden="true">{{ showConfirmPassword ? 'visibility' : 'visibility_off' }}</span>
              </button>
            </div>
          </label>

          <label class="terms">
            <input type="checkbox" [(ngModel)]="acceptedTerms" name="acceptedTerms" />
            <span>Eu concordo com os <a routerLink="/register">Termos de Uso</a> e a <a routerLink="/register">Politica de Privacidade</a></span>
          </label>

          @if (error()) {
            <p class="error">{{ error() }}</p>
          }

          <button class="primary-action" type="submit" [disabled]="auth.isLoading()">
            {{ auth.isLoading() ? 'Criando conta...' : 'Criar conta' }}
          </button>
        </form>

        <div class="divider"><span>ou cadastre-se com</span></div>

        <div class="social-grid" aria-label="Metodos de cadastro social">
          <button type="button" (click)="registerWithProvider('Google')" aria-label="Cadastrar com Google">
            <span class="google">G</span>
            Google
          </button>
          <button type="button" (click)="registerWithProvider('Apple')" aria-label="Cadastrar com Apple">
            <span class="apple">A</span>
            Apple
          </button>
          <button type="button" (click)="registerWithProvider('Microsoft')" aria-label="Cadastrar com Microsoft">
            <span class="microsoft" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
            Microsoft
          </button>
        </div>

        <p class="switch-link">Ja tem uma conta? <a routerLink="/login">Entrar</a></p>

        <section class="smart-card">
          <div class="smart-icon material-symbols-rounded" aria-hidden="true">star</div>
          <div>
            <h2>Smartwallet</h2>
            <p>Mais que uma carteira, uma inteligencia para multiplicar seus resultados.</p>
          </div>
        </section>
      </section>

      <section class="phone-showcase" aria-hidden="true">
        <div class="phone">
          <div class="phone-notch"></div>
          <div class="phone-content">
            <p>Patrimonio total</p>
            <strong>R$ 125.430,80</strong>
            <span>+7,52% nos ultimos 30 dias</span>
            <div class="line-chart"></div>
            <div class="donut"></div>
            <ul>
              <li><i></i>Renda Fixa <b>40%</b></li>
              <li><i></i>Acoes <b>30%</b></li>
              <li><i></i>FIIs <b>20%</b></li>
            </ul>
          </div>
        </div>
        <div class="bar-stack"><i></i><i></i><i></i><i></i></div>
        <div class="showcase-ring"></div>
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
      grid-template-columns: minmax(420px, 620px) minmax(360px, 1fr);
      gap: 48px;
      align-items: center;
      padding: 54px 8vw;
      background:
        radial-gradient(circle at 72% 18%, rgba(124, 58, 237, 0.24), transparent 28%),
        radial-gradient(circle at 16% 75%, rgba(37, 99, 235, 0.18), transparent 32%),
        radial-gradient(circle at 92% 72%, rgba(16, 185, 129, 0.16), transparent 24%),
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
      filter: blur(22px);
    }

    .auth-page::before {
      top: -150px;
      left: 12%;
      background: radial-gradient(circle, rgba(105, 41, 255, 0.18), transparent 70%);
    }

    .auth-page::after {
      right: -130px;
      bottom: 8%;
      background: radial-gradient(circle, rgba(39, 226, 155, 0.14), transparent 70%);
    }

    .register-column {
      position: relative;
      z-index: 2;
      display: grid;
      gap: 20px;
      padding: 22px 0;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 18px;
      color: #fff;
      font-size: 44px;
      font-weight: 900;
      line-height: 1;
      text-decoration: none;
    }

    .brand strong,
    h1 span,
    .smart-card h2,
    .switch-link a,
    .terms a {
      color: #27e29b;
    }

    .brand-symbol {
      width: 96px;
      height: 72px;
      display: grid;
      place-items: center;
      color: transparent;
      font-size: 58px;
      font-weight: 1000;
      background: linear-gradient(135deg, #6929ff, #24e49d);
      -webkit-background-clip: text;
      background-clip: text;
      filter: drop-shadow(0 18px 30px rgba(105, 41, 255, 0.35));
    }

    .brand:hover .brand-symbol {
      filter: drop-shadow(0 22px 42px rgba(39, 226, 155, 0.26));
      transform: translateY(-1px);
    }

    h1 {
      margin: 0;
      font-size: clamp(38px, 5vw, 56px);
      line-height: 1.05;
    }

    .auth-header p {
      max-width: 520px;
      margin: 18px 0 0;
      color: #c6cbea;
      font-size: 23px;
      line-height: 1.35;
    }

    .auth-form {
      display: grid;
      gap: 15px;
    }

    .split-fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .field {
      display: grid;
      gap: 9px;
      color: #fff;
      font-size: 18px;
      font-weight: 800;
    }

    .input-shell {
      min-height: 60px;
      display: grid;
      grid-template-columns: 32px minmax(0, 1fr) 40px;
      align-items: center;
      gap: 14px;
      padding: 0 20px;
      border: 1px solid rgba(139, 148, 196, 0.32);
      border-radius: 16px;
      background: rgba(8, 12, 34, 0.78);
      transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
    }

    .input-shell:hover {
      border-color: rgba(139, 92, 246, 0.46);
      background: rgba(10, 14, 42, 0.84);
    }

    .input-shell.compact {
      grid-template-columns: 30px minmax(0, 1fr);
    }

    .input-shell:focus-within {
      border-color: rgba(39, 226, 155, 0.75);
      box-shadow: 0 0 0 4px rgba(39, 226, 155, 0.12), 0 16px 38px rgba(80, 47, 255, 0.16);
    }

    .input-shell > .material-symbols-rounded {
      color: #8b5cf6;
      font-size: 28px;
    }

    input {
      width: 100%;
      border: 0;
      outline: 0;
      color: #fff;
      background: transparent;
      font-size: 18px;
    }

    input::placeholder {
      color: #aeb5d8;
    }

    .icon-button {
      width: 36px;
      height: 36px;
      display: grid;
      place-items: center;
      border: 0;
      color: #8b5cf6;
      background: transparent;
      cursor: pointer;
    }

    .terms {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #d8dcff;
      font-size: 15px;
      line-height: 1.35;
    }

    .terms input {
      width: 26px;
      height: 26px;
      accent-color: #8b5cf6;
      flex: 0 0 auto;
    }

    .terms a {
      text-decoration: none;
      font-weight: 800;
    }

    .primary-action {
      min-height: 68px;
      border: 0;
      border-radius: 18px;
      color: #fff;
      font-size: 25px;
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
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 18px;
      color: #b8bddb;
      font-size: 17px;
    }

    .divider::before,
    .divider::after {
      height: 1px;
      content: '';
      background: rgba(184, 189, 219, 0.28);
    }

    .social-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }

    .social-grid button {
      min-height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 11px;
      border: 1px solid rgba(139, 148, 196, 0.26);
      border-radius: 15px;
      color: #fff;
      font-size: 19px;
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
      font-size: 19px;
      text-align: center;
    }

    .switch-link a {
      font-weight: 900;
      text-decoration: none;
    }

    .smart-card {
      display: grid;
      grid-template-columns: 82px 1fr;
      align-items: center;
      gap: 22px;
      margin-top: 12px;
      padding: 28px;
      border: 1px solid rgba(139, 148, 196, 0.22);
      border-radius: 24px;
      background: rgba(10, 14, 38, 0.7);
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.22);
      backdrop-filter: blur(18px);
    }

    .smart-icon {
      width: 82px;
      height: 82px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #27e29b;
      font-size: 46px;
      background: radial-gradient(circle, rgba(39, 226, 155, 0.22), rgba(105, 41, 255, 0.36));
    }

    .smart-card h2 {
      margin: 0;
      font-size: 25px;
    }

    .smart-card p {
      margin: 10px 0 0;
      color: #c6cbea;
      font-size: 18px;
      line-height: 1.45;
    }

    .phone-showcase {
      position: relative;
      min-height: 680px;
      display: grid;
      place-items: center;
    }

    .phone {
      position: relative;
      z-index: 2;
      width: 294px;
      height: 600px;
      padding: 38px 22px 26px;
      border: 4px solid rgba(226, 232, 255, 0.72);
      border-radius: 48px;
      transform: rotate(-5deg);
      background: linear-gradient(155deg, #08122f, #05081d 72%);
      box-shadow: 0 38px 90px rgba(0, 0, 0, 0.42), 0 0 80px rgba(105, 41, 255, 0.2);
    }

    .phone-notch {
      position: absolute;
      top: 14px;
      left: 50%;
      width: 112px;
      height: 22px;
      border-radius: 0 0 18px 18px;
      transform: translateX(-50%);
      background: #020617;
    }

    .phone-content p,
    .phone-content span {
      margin: 0;
      color: #c6cbea;
      font-size: 14px;
    }

    .phone-content strong {
      display: block;
      margin: 10px 0;
      font-size: 27px;
    }

    .phone-content > span {
      display: inline-block;
      padding: 6px 8px;
      border-radius: 9px;
      color: #b8ffdf;
      background: rgba(39, 226, 155, 0.18);
    }

    .line-chart {
      height: 150px;
      margin: 28px 0;
      border-bottom: 1px solid rgba(139, 148, 196, 0.16);
      background:
        linear-gradient(135deg, transparent 0 18%, #27e29b 19% 21%, transparent 22% 31%, #27e29b 32% 34%, transparent 35% 46%, #27e29b 47% 49%, transparent 50% 61%, #27e29b 62% 64%, transparent 65%),
        linear-gradient(to top, rgba(39, 226, 155, 0.18), transparent);
    }

    .donut {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: conic-gradient(#6929ff 0 32%, #2563eb 32% 62%, #14b8a6 62% 80%, #27e29b 80% 100%);
      box-shadow: inset 0 0 0 28px #08122f;
    }

    .phone ul {
      position: absolute;
      right: 22px;
      bottom: 88px;
      display: grid;
      gap: 10px;
      margin: 0;
      padding: 0;
      list-style: none;
      color: #fff;
      font-size: 12px;
    }

    .phone li {
      display: grid;
      grid-template-columns: 10px 1fr auto;
      gap: 7px;
      align-items: center;
    }

    .phone li i {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #27e29b;
    }

    .bar-stack {
      position: absolute;
      right: 9%;
      bottom: 98px;
      z-index: 3;
      display: flex;
      align-items: end;
      gap: 11px;
    }

    .bar-stack i {
      width: 28px;
      border-radius: 8px 8px 0 0;
      background: linear-gradient(to top, #6929ff, #27e29b);
      box-shadow: 0 0 25px rgba(39, 226, 155, 0.24);
    }

    .bar-stack i:nth-child(1) { height: 70px; }
    .bar-stack i:nth-child(2) { height: 98px; }
    .bar-stack i:nth-child(3) { height: 132px; }
    .bar-stack i:nth-child(4) { height: 170px; }

    .showcase-ring {
      position: absolute;
      right: 2%;
      bottom: 54px;
      width: 420px;
      height: 110px;
      border: 1px solid rgba(105, 41, 255, 0.42);
      border-radius: 50%;
      box-shadow: 0 0 50px rgba(105, 41, 255, 0.2);
    }

    @media (max-width: 1050px) {
      .auth-page {
        grid-template-columns: 1fr;
      }

      .phone-showcase {
        display: none;
      }
    }

    @media (max-width: 640px) {
      .auth-page {
        padding: 30px 16px;
      }

      .brand {
        font-size: 34px;
      }

      .split-fields,
      .social-grid {
        grid-template-columns: 1fr;
      }

      h1 {
        font-size: 36px;
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

      .smart-card {
        grid-template-columns: 1fr;
        text-align: center;
      }
    }
  `]
})
export class RegisterComponent {
  protected auth = inject(AuthService);
  private readonly router = inject(Router);

  protected fullName = '';
  protected cpf = '';
  protected phone = '';
  protected email = '';
  protected password = '';
  protected confirmPassword = '';
  protected acceptedTerms = false;
  protected showPassword = false;
  protected showConfirmPassword = false;
  protected error = signal<string>('');

  protected onSubmit(): void {
    this.error.set('');

    if (!this.fullName || !this.cpf || !this.phone || !this.email || !this.password) {
      this.error.set('Por favor, preencha todos os campos');
      return;
    }

    if (!this.acceptedTerms) {
      this.error.set('Aceite os termos para criar sua conta');
      return;
    }

    const onlyDigitsCpf = this.cpf.replace(/\D/g, '');
    if (onlyDigitsCpf.length !== 11) {
      this.error.set('O CPF deve ter 11 digitos.');
      return;
    }

    const onlyDigitsPhone = this.phone.replace(/\D/g, '');
    if (onlyDigitsPhone.length < 10) {
      this.error.set('O telefone deve ter pelo menos 10 digitos.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error.set('As senhas nao conferem');
      return;
    }

    if (this.password.length < 6) {
      this.error.set('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    console.log('Tentando cadastrar:', {
      fullName: this.fullName,
      cpf: onlyDigitsCpf,
      phone: onlyDigitsPhone,
      email: this.email
    });

    this.auth.register({
      fullName: this.fullName,
      cpf: onlyDigitsCpf,
      phone: onlyDigitsPhone,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        void this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error("Erro ao criar conta:", err);
        this.error.set(err.error?.message || 'Erro ao criar conta. Tente novamente.');
      }
    });
  }

  protected registerWithProvider(provider: 'Google' | 'Apple' | 'Microsoft'): void {
    this.error.set(`Cadastro com ${provider} ainda precisa ser conectado no backend.`);
  }
}
