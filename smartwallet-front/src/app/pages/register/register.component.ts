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

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Senha</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Confirmar Senha</label>
            <input
              type="password"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              required
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            [disabled]="auth.isLoading()"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ng-container *ngIf="auth.isLoading(); else submitLabel">
              <span class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Criando conta...
              </span>
            </ng-container>
            <ng-template #submitLabel>
              Criar Conta
            </ng-template>
          </button>
        </form>
        <p class="text-center text-gray-400 mt-6">
          Já tem conta?
          <a routerLink="/login" class="text-blue-400 hover:text-blue-300 font-medium">Entrar</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  auth = inject(AuthService);
  router = inject(Router);

  fullName = '';
  cpf = '';
  phone = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = signal<string>('');

  onSubmit() {
    this.error.set('');

    // Validações obrigatórias
    if (!this.fullName || !this.cpf || !this.phone || !this.email || !this.password) {
      this.error.set('Por favor, preencha todos os campos');
      return;
    }

    // Validação CPF (apenas números, obrigatoriamente 11 dígitos)
    const onlyDigitsCpf = this.cpf.replace(/\D/g, '');
    if (onlyDigitsCpf.length !== 11) {
      this.error.set('O CPF deve ter 11 dígitos.');
      return;
    }

    // Validação Telefone (apenas números, no mínimo 10 dígitos)
    const onlyDigitsPhone = this.phone.replace(/\D/g, '');
    if (onlyDigitsPhone.length < 10) {
      this.error.set('O telefone deve ter pelo menos 10 dígitos.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error.set('As senhas não conferem');
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
      next: (res) => {
        console.log("Cadastro efetuado com sucesso:", res);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error("Erro ao criar conta:", err);
        this.error.set(err.error?.message || 'Erro ao criar conta. Tente novamente.');
      }
    });
  }
}
