import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Wallet, PortfolioSummary, Asset } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-900">
      <!-- Header -->
      <header class="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <h1 class="text-2xl font-bold text-white">Dashboard</h1>
          <div class="flex items-center gap-4">
            <span class="text-gray-300">{{ auth.user()?.fullName }}</span>
            <button (click)="auth.logout()" class="text-gray-400 hover:text-white">Sair</button>
          </div>
        </div>
      </header>

      <!-- Navigation -->
      <nav class="bg-gray-800/50 border-b border-gray-700 px-6">
        <div class="max-w-7xl mx-auto flex gap-6">
          <a routerLink="/dashboard" class="py-4 px-2 text-blue-400 border-b-2 border-blue-400 font-medium">Dashboard</a>
          <a routerLink="/market" class="py-4 px-2 text-gray-400 hover:text-white transition-colors">Ativos</a>
          <a routerLink="/ai-analysis" class="py-4 px-2 text-gray-400 hover:text-white transition-colors">Análise IA</a>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-6 py-8">
        @if (loading()) {
          <div class="flex items-center justify-center py-20">
            <svg class="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </div>
        } @else if (error()) {
          <div class="bg-red-900/20 border border-red-500 rounded-lg p-6 text-red-300">
            <p class="font-bold">❌ Erro ao carregar dados</p>
            <p class="text-sm mt-2">{{ error() }}</p>
            <button (click)="loadData()" class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors">
              Tentar Novamente
            </button>
          </div>
        } @else {
          <!-- Portfolio Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p class="text-gray-400 text-sm mb-1">Patrimônio Total</p>
              <p class="text-3xl font-bold text-white">{{ summary()?.totalCurrentValue | currency:'BRL' }}</p>
            </div>
            <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p class="text-gray-400 text-sm mb-1">Total Investido</p>
              <p class="text-3xl font-bold text-white">{{ summary()?.totalInvested | currency:'BRL' }}</p>
            </div>
            <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p class="text-gray-400 text-sm mb-1">Lucro/Prejuízo</p>
              <p class="text-3xl font-bold" [class]="(summary()?.totalProfitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'">
                {{ summary()?.totalProfitLoss | currency:'BRL' }}
              </p>
            </div>
            <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p class="text-gray-400 text-sm mb-1">Rentabilidade</p>
              <p class="text-3xl font-bold" [class]="(summary()?.totalProfitLossPercentage || 0) >= 0 ? 'text-green-400' : 'text-red-400'">
                {{ summary()?.totalProfitLossPercentage | number:'1.2-2' }}%
              </p>
            </div>
          </div>

          <!-- Asset Allocation Chart Placeholder -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 class="text-lg font-semibold text-white mb-4">Alocação por Tipo</h3>
              <div class="flex items-center justify-center h-48 text-gray-500">
                @if (summary()?.byType?.length) {
                  <div class="w-full">
                    @for (type of summary()?.byType; track type.type) {
                      <div class="flex items-center justify-between py-2 border-b border-gray-700">
                        <span class="text-gray-300">{{ type.type }}</span>
                        <span class="text-white font-medium">{{ type.totalValue | currency:'BRL' }}</span>
                      </div>
                    }
                  </div>
                } @else {
                  <p>Nenhum ativo encontrado</p>
                }
              </div>
            </div>

            <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 class="text-lg font-semibold text-white mb-4">Wallets</h3>
              <div class="space-y-3">
                @for (wallet of wallets(); track wallet.id) {
                  <a [routerLink]="['/wallet', wallet.id, 'assets']" class="block p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                    <div class="flex items-center justify-between">
                      <span class="text-white font-medium">{{ wallet.name }}</span>
                      <span class="text-gray-400">{{ wallet.totalBalance | currency:'BRL' }}</span>
                    </div>
                  </a>
                }
                @if (wallets().length === 0) {
                  <p class="text-gray-500 text-center py-4">Nenhuma wallet encontrada</p>
                }
              </div>
              <button (click)="createWallet()" class="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                + Nova Wallet
              </button>
            </div>
          </div>

          <!-- Recent Assets -->
          <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-white">Ativos</h3>
              <a routerLink="/market" class="text-blue-400 hover:text-blue-300">Ver todos</a>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                <tr class="text-left text-gray-400 text-sm border-b border-gray-700">
                  <th class="pb-3">Símbolo</th>
                  <th class="pb-3">Nome</th>
                  <th class="pb-3">Tipo</th>
                  <th class="pb-3 text-right">Quantidade</th>
                  <th class="pb-3 text-right">Valor Atual</th>
                  <th class="pb-3 text-right">Lucro/Prejuízo</th>
                </tr>
                </thead>
                <tbody>
                  @for (asset of assets().slice(0, 5); track asset.id) {
                    <tr class="border-b border-gray-700/50">
                      <td class="py-3 text-white font-medium">{{ asset.symbol }}</td>
                      <td class="py-3 text-gray-300">{{ asset.name }}</td>
                      <td class="py-3 text-gray-400">{{ asset.assetType }}</td>
                      <td class="py-3 text-right text-gray-300">{{ asset.quantity | number:'1.0-4' }}</td>
                      <td class="py-3 text-right text-white">{{ asset.currentValue | currency:'BRL' }}</td>
                      <td class="py-3 text-right" [class]="(asset.profitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'">
                        {{ asset.profitLoss | currency:'BRL' }}
                      </td>
                    </tr>
                  }
                  @if (assets().length === 0) {
                    <tr>
                      <td colspan="6" class="py-8 text-center text-gray-500">Nenhum ativo encontrado</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </main>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  api = inject(ApiService);

  loading = signal(true);
  error = signal<string | null>(null);
  wallets = signal<Wallet[]>([]);
  assets = signal<Asset[]>([]);
  summary = signal<PortfolioSummary | null>(null);

  ngOnInit() {
    console.log('🚀 DashboardComponent ngOnInit');
    this.loadData();
  }

  loadData() {
    console.log('📊 Carregando dados do dashboard...');
    this.loading.set(true);
    this.error.set(null);

    // Requisição 1: Wallets
    this.api.getWallets().subscribe({
      next: (data) => {
        console.log('✅ Wallets carregadas:', data);
        this.wallets.set(data);
        if (data.length > 0) {
          this.loadAssets(data[0].id);
        } else {
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('❌ Erro ao carregar wallets:', err);
        this.wallets.set([]);
        this.assets.set([]);
        this.summary.set({
          totalInvested: 0,
          totalCurrentValue: 0,
          totalProfitLoss: 0,
          totalProfitLossPercentage: 0,
          walletCount: 0,
          assetCount: 0,
          byType: []
        });
        this.loading.set(false);
      }
    });

    // Requisição 2: Portfolio Summary
    this.api.getPortfolioSummary().subscribe({
      next: (data) => {
        console.log('✅ Portfolio Summary carregado:', data);
        this.summary.set(data);
      },
      error: (err) => {
        console.error('❌ Erro ao carregar portfolio summary:', err);
        this.summary.set({
          totalInvested: 0,
          totalCurrentValue: 0,
          totalProfitLoss: 0,
          totalProfitLossPercentage: 0,
          walletCount: this.wallets().length,
          assetCount: this.assets().length,
          byType: []
        });
      }
    });
  }

  loadAssets(walletId: number) {
    console.log('📦 Carregando assets da wallet:', walletId);
    this.api.getWalletAssets(walletId).subscribe({
      next: (data) => {
        console.log('✅ Assets carregados:', data);
        this.assets.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Erro ao carregar assets:', err);
        this.error.set(err.message || 'Erro ao carregar assets');
        this.loading.set(false);
      }
    });
  }

  createWallet() {
    const name = prompt('Nome da wallet:');
    if (name) {
      this.api.createWallet(name).subscribe({
        next: (wallet) => {
          console.log('✅ Wallet criada:', wallet);
          this.wallets.update(w => [...w, wallet]);
        },
        error: (err) => {
          console.error('❌ Erro ao criar wallet:', err);
        }
      });
    }
  }
}
