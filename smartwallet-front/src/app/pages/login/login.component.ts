import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div class="max-w-md w-full bg-gray-800 rounded-xl p-8 shadow-2xl">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">SmartWallet</h1>
          <p class="text-gray-400">Entre na sua conta</p>
        </div>

        @if (error()) {
          <div class="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
            {{ error() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="space-y-6">
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
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            [disabled]="auth.isLoading()"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            @if (auth.isLoading()) {
              <span class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Entrando...
              </span>
            } @else {
              Entrar
            }
          </button>
        </form>

        <p class="text-center text-gray-400 mt-6">
          Não tem conta?
          <a routerLink="/register" class="text-blue-400 hover:text-blue-300 font-medium">Criar conta</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);

  email = '';
  password = '';
  error = signal<string>('');

  onSubmit() {
    this.error.set('');
    
    if (!this.email || !this.password) {
      this.error.set('Por favor, preencha todos os campos');
      return;
    }

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erro ao fazer login. Verifique suas credenciais.');
      }
    });
  }
}