import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, Wallet, Asset } from '../../services/api.service';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-900">
      <!-- Header -->
      <header class="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <h1 class="text-2xl font-bold text-white">SmartWallet</h1>
          <div class="flex items-center gap-4">
            <span class="text-gray-300">Ativos</span>
          </div>
        </div>
      </header>

      <!-- Navigation -->
      <nav class="bg-gray-800/50 border-b border-gray-700 px-6">
        <div class="max-w-7xl mx-auto flex gap-6">
          <a routerLink="/dashboard" class="py-4 px-2 text-gray-400 hover:text-white transition-colors">Dashboard</a>
          <a routerLink="/assets" class="py-4 px-2 text-blue-400 border-b-2 border-blue-400 font-medium">Ativos</a>
          <a routerLink="/ai" class="py-4 px-2 text-gray-400 hover:text-white transition-colors">Análise IA</a>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-6 py-8">
        <!-- Wallet Selector -->
        <div class="mb-6">
          <label class="text-gray-400 text-sm mr-3">Carteira:</label>
          <select 
            (change)="onWalletChange($event)" 
            class="bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            @for (wallet of wallets(); track wallet.id) {
              <option [value]="wallet.id">{{ wallet.name }}</option>
            }
          </select>
        </div>

        <!-- Add Asset Button -->
        <div class="flex justify-end mb-6">
          <button 
            (click)="showAddModal.set(true)"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + Adicionar Ativo
          </button>
        </div>

        @if (loading()) {
          <div class="flex items-center justify-center py-20">
            <svg class="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </div>
        } @else {
          <!-- Assets Table -->
          <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <table class="w-full">
              <thead class="bg-gray-700/50">
                <tr class="text-left text-gray-400 text-sm">
                  <th class="px-6 py-4">Símbolo</th>
                  <th class="px-6 py-4">Nome</th>
                  <th class="px-6 py-4">Tipo</th>
                  <th class="px-6 py-4 text-right">Quantidade</th>
                  <th class="px-6 py-4 text-right">Preço Médio</th>
                  <th class="px-6 py-4 text-right">Preço Atual</th>
                  <th class="px-6 py-4 text-right">Valor Total</th>
                  <th class="px-6 py-4 text-right">Lucro/Prejuízo</th>
                  <th class="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (asset of assets(); track asset.id) {
                  <tr class="border-t border-gray-700/50 hover:bg-gray-700/30">
                    <td class="px-6 py-4 text-white font-medium">{{ asset.symbol }}</td>
                    <td class="px-6 py-4 text-gray-300">{{ asset.name }}</td>
                    <td class="px-6 py-4 text-gray-400">
                      <span class="px-2 py-1 bg-gray-700 rounded text-xs">{{ asset.assetType }}</span>
                    </td>
                    <td class="px-6 py-4 text-right text-gray-300">{{ asset.quantity | number:'1.0-4' }}</td>
                    <td class="px-6 py-4 text-right text-gray-300">{{ asset.averagePrice | currency:'BRL' }}</td>
                    <td class="px-6 py-4 text-right text-white">{{ asset.currentPrice | currency:'BRL' }}</td>
                    <td class="px-6 py-4 text-right text-white font-medium">{{ asset.currentValue | currency:'BRL' }}</td>
                    <td class="px-6 py-4 text-right" [class]="(asset.profitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'">
                      {{ asset.profitLoss | currency:'BRL' }} ({{ asset.profitLossPercentage | number:'1.2-2' }}%)
                    </td>
                    <td class="px-6 py-4 text-center">
                      <button (click)="editAsset(asset)" class="text-blue-400 hover:text-blue-300 mx-1">Editar</button>
                      <button (click)="deleteAsset(asset)" class="text-red-400 hover:text-red-300 mx-1">Excluir</button>
                    </td>
                  </tr>
                }
                @if (assets().length === 0) {
                  <tr>
                    <td colspan="9" class="px-6 py-12 text-center text-gray-500">
                      Nenhum ativo encontrado. Adicione seu primeiro ativo!
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- Add/Edit Modal -->
        @if (showAddModal()) {
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div class="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
              <h3 class="text-xl font-semibold text-white mb-4">{{ editingAsset() ? 'Editar' : 'Adicionar' }} Ativo</h3>
              
              <form (ngSubmit)="saveAsset()" class="space-y-4">
                <div>
                  <label class="block text-sm text-gray-300 mb-1">Símbolo</label>
                  <input [(ngModel)]="assetForm.symbol" name="symbol" required class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white" placeholder="PETR4">
                </div>
                <div>
                  <label class="block text-sm text-gray-300 mb-1">Nome</label>
                  <input [(ngModel)]="assetForm.name" name="name" required class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white" placeholder="Petrobras">
                </div>
                <div>
                  <label class="block text-sm text-gray-300 mb-1">Tipo</label>
                  <select [(ngModel)]="assetForm.assetType" name="assetType" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white">
                    <option value="STOCK">Ação</option>
                    <option value="ETF">ETF</option>
                    <option value="FII">FII</option>
                    <option value="CRYPTO">Criptomoeda</option>
                    <option value="BOND">Renda Fixa</option>
                    <option value="FUND">Fundo</option>
                  </select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm text-gray-300 mb-1">Quantidade</label>
                    <input [(ngModel)]="assetForm.quantity" name="quantity" type="number" step="0.0001" required class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white">
                  </div>
                  <div>
                    <label class="block text-sm text-gray-300 mb-1">Preço Compra</label>
                    <input [(ngModel)]="assetForm.purchasePrice" name="purchasePrice" type="number" step="0.01" required class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white">
                  </div>
                </div>
                <div>
                  <label class="block text-sm text-gray-300 mb-1">Data Compra</label>
                  <input [(ngModel)]="assetForm.purchaseDate" name="purchaseDate" type="date" required class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white">
                </div>
                <div class="flex gap-3 mt-6">
                  <button type="button" (click)="closeModal()" class="flex-1 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors">Cancelar</button>
                  <button type="submit" class="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">Salvar</button>
                </div>
              </form>
            </div>
          </div>
        }
      </main>
    </div>
  `
})
export class AssetsComponent implements OnInit {
  api = inject(ApiService);

  loading = signal(true);
  wallets = signal<Wallet[]>([]);
  assets = signal<Asset[]>([]);
  selectedWalletId = signal<number | null>(null);
  showAddModal = signal(false);
  editingAsset = signal<Asset | null>(null);

  assetForm = {
    symbol: '',
    name: '',
    assetType: 'STOCK',
    quantity: 0,
    purchasePrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0]
  };

  ngOnInit() {
    this.loadWallets();
  }

  loadWallets() {
    this.api.getWallets().subscribe({
      next: (data) => {
        this.wallets.set(data);
        if (data.length > 0) {
          this.selectedWalletId.set(data[0].id);
          this.loadAssets(data[0].id);
        } else {
          this.loading.set(false);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  loadAssets(walletId: number) {
    this.loading.set(true);
    this.api.getWalletAssets(walletId).subscribe({
      next: (data) => {
        this.assets.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onWalletChange(event: Event) {
    const walletId = +(event.target as HTMLSelectElement).value;
    this.selectedWalletId.set(walletId);
    this.loadAssets(walletId);
  }

  editAsset(asset: Asset) {
    this.editingAsset.set(asset);
    this.assetForm = {
      symbol: asset.symbol,
      name: asset.name,
      assetType: asset.assetType || 'STOCK',
      quantity: +(asset.quantity || 0),
      purchasePrice: +(asset.purchasePrice || 0),
      purchaseDate: asset.purchaseDate?.split('T')[0] || new Date().toISOString().split('T')[0]
    };
    this.showAddModal.set(true);
  }

  deleteAsset(asset: Asset) {
    if (!asset.id || !confirm(`Tem certeza que deseja excluir ${asset.symbol}?`)) return;
    this.api.deleteAsset(asset.id).subscribe({
      next: () => {
        this.assets.update(a => a.filter(x => x.id !== asset.id));
      }
    });
  }

  saveAsset() {
    const walletId = this.selectedWalletId();
    if (!walletId) return;

    const assetData = {
      symbol: this.assetForm.symbol.toUpperCase(),
      name: this.assetForm.name,
      assetType: this.assetForm.assetType,
      quantity: this.assetForm.quantity,
      purchasePrice: this.assetForm.purchasePrice,
      currentPrice: this.assetForm.purchasePrice,
      purchaseDate: this.assetForm.purchaseDate
    };

    const editingId = this.editingAsset()?.id;
    const request = editingId
      ? this.api.updateAssetPrice(editingId, this.assetForm.purchasePrice)
      : this.api.addAsset(walletId, assetData);

    request.subscribe({
      next: () => {
        this.closeModal();
        this.loadAssets(walletId);
      }
    });
  }

  closeModal() {
    this.showAddModal.set(false);
    this.editingAsset.set(null);
    this.assetForm = {
      symbol: '',
      name: '',
      assetType: 'STOCK',
      quantity: 0,
      purchasePrice: 0,
      purchaseDate: new Date().toISOString().split('T')[0]
    };
  }
}