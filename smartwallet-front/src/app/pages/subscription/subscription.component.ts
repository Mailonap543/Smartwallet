import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionService, Plan } from '../../services/subscription.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-900 text-white p-6">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold mb-2">Planos e Assinatura</h1>
        <p class="text-gray-400 mb-8">Escolha o plano ideal para suas necessidades</p>

        <!-- Current Plan -->
        @if (currentPlan()) {
          <div class="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-400 text-sm">Seu plano atual</p>
                <h2 class="text-2xl font-bold text-white">{{ currentPlan()?.['planName'] }}</h2>
              </div>
              <button (click)="showPlans = !showPlans" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
                Alterar Plano
              </button>
            </div>
            
            @if (currentPlan()?.['features']) {
              <div class="mt-4 flex flex-wrap gap-2">
                @for (feature of currentPlan()?.['features']; track feature) {
                  <span class="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                    {{ feature }}
                  </span>
                }
              </div>
            }
          </div>
        }

        <!-- Plans -->
        @if (showPlans) {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @for (plan of availablePlans(); track plan.name) {
              <div class="bg-gray-800 rounded-xl p-6 border" 
                   [class.border-blue-500]="currentPlan()?.['plan'] === plan.name"
                   [class.border-gray-700]="currentPlan()?.['plan'] !== plan.name">
                <div class="text-center mb-6">
                  <h3 class="text-xl font-bold">{{ plan.displayName }}</h3>
                  <p class="text-gray-400 text-sm mt-1">{{ plan.description }}</p>
                </div>
                
                <div class="text-center mb-6">
                  <span class="text-4xl font-bold">R$ {{ plan.monthlyPrice }}</span>
                  <span class="text-gray-400">/mês</span>
                </div>

                <ul class="space-y-3 mb-6">
                  <li class="flex items-center text-gray-300">
                    <span class="text-green-400 mr-2">✓</span>
                    {{ plan.maxWallets === -1 ? 'Wallets ilimitados' : plan.maxWallets + ' wallets' }}
                  </li>
                  <li class="flex items-center text-gray-300">
                    <span class="text-green-400 mr-2">✓</span>
                    {{ plan.maxAssets === -1 ? 'Ativos ilimitados' : plan.maxAssets + ' ativos' }}
                  </li>
                  <li class="flex items-center" [class.text-gray-300]="plan.aiAnalysis" [class.text-gray-600]="!plan.aiAnalysis">
                    <span class="mr-2" [class.text-green-400]="plan.aiAnalysis" [class.text-gray-600]="!plan.aiAnalysis">
                      {{ plan.aiAnalysis ? '✓' : '✗' }}
                    </span>
                    Análise IA
                  </li>
                  <li class="flex items-center" [class.text-gray-300]="plan.realTimePrices" [class.text-gray-600]="!plan.realTimePrices">
                    <span class="mr-2" [class.text-green-400]="plan.realTimePrices" [class.text-gray-600]="!plan.realTimePrices">
                      {{ plan.realTimePrices ? '✓' : '✗' }}
                    </span>
                    Preços em tempo real
                  </li>
                  <li class="flex items-center" [class.text-gray-300]="plan.bankIntegration" [class.text-gray-600]="!plan.bankIntegration">
                    <span class="mr-2" [class.text-green-400]="plan.bankIntegration" [class.text-gray-600]="!plan.bankIntegration">
                      {{ plan.bankIntegration ? '✓' : '✗' }}
                    </span>
                    Integração bancária
                  </li>
                  <li class="flex items-center" [class.text-gray-300]="plan.advancedReports" [class.text-gray-600]="!plan.advancedReports">
                    <span class="mr-2" [class.text-green-400]="plan.advancedReports" [class.text-gray-600]="!plan.advancedReports">
                      {{ plan.advancedReports ? '✓' : '✗' }}
                    </span>
                    Relatórios avançados
                  </li>
                </ul>

                @if (currentPlan()?.['plan'] !== plan.name) {
                  <button 
                    (click)="upgrade(plan.name)"
                    [disabled]="upgrading()"
                    class="w-full py-3 rounded-lg font-semibold transition-colors"
                    [class.bg-blue-600]="plan.monthlyPrice > 0"
                    [class.hover:bg-blue-700]="plan.monthlyPrice > 0"
                    [class.bg-gray-700]="plan.monthlyPrice === 0"
                    [class.hover:bg-gray-600]="plan.monthlyPrice === 0"
                    [class.disabled:opacity-50]="upgrading()"
                  >
                    @if (upgrading()) {
                      <span class="inline-flex items-center">
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Processando...
                      </span>
                    } @else {
                      {{ plan.monthlyPrice === 0 ? 'Downgrade' : 'Assinar' }}
                    }
                  </button>
                } @else {
                  <button disabled class="w-full py-3 bg-green-600/50 text-white rounded-lg font-semibold cursor-not-allowed">
                    Plano Atual
                  </button>
                }
              </div>
            }
          </div>
        }

        <!-- Limits Info -->
        @if (!showPlans && currentPlan()?.['limits']) {
          <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 class="text-lg font-semibold mb-4"> Seus Limites</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center p-4 bg-gray-700/50 rounded-lg">
                <p class="text-gray-400 text-sm">Wallets</p>
                <p class="text-2xl font-bold">
                  {{ currentPlan()?.['limits']?.['wallets'] === -1 ? '∞' : currentPlan()?.['limits']?.['wallets'] }}
                </p>
              </div>
              <div class="text-center p-4 bg-gray-700/50 rounded-lg">
                <p class="text-gray-400 text-sm">Ativos</p>
                <p class="text-2xl font-bold">
                  {{ currentPlan()?.['limits']?.['assets'] === -1 ? '∞' : currentPlan()?.['limits']?.['assets'] }}
                </p>
              </div>
              <div class="text-center p-4 bg-gray-700/50 rounded-lg">
                <p class="text-gray-400 text-sm">Histórico</p>
                <p class="text-2xl font-bold">
                  {{ currentPlan()?.['limits']?.['dataHistoryDays'] === -1 ? '∞ dias' : currentPlan()?.['limits']?.['dataHistoryDays'] + ' dias' }}
                </p>
              </div>
              <div class="text-center p-4 bg-gray-700/50 rounded-lg">
                <p class="text-gray-400 text-sm">IA</p>
                <p class="text-2xl font-bold">
                  {{ currentPlan()?.['permissions']?.['aiAnalysis'] ? '✓' : '✗' }}
                </p>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class SubscriptionComponent implements OnInit {
  subscriptionService = inject(SubscriptionService);
  auth = inject(AuthService);

  currentPlan = signal<any>(null);
  availablePlans = signal<Plan[]>([]);
  showPlans = signal(false);
  upgrading = signal(false);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.subscriptionService.getMyPlan().subscribe({
      next: (data) => this.currentPlan.set(data)
    });

    this.subscriptionService.getAvailablePlans().subscribe({
      next: (data) => this.availablePlans.set(data.map((p: any) => ({
        name: p.name,
        displayName: p.displayName,
        description: p.description,
        monthlyPrice: p.monthlyPrice,
        maxWallets: p.maxWallets,
        maxAssets: p.maxAssets,
        aiAnalysis: p.aiAnalysis,
        realTimePrices: p.realTimePrices,
        bankIntegration: p.bankIntegration,
        advancedReports: p.advancedReports,
        dataHistoryDays: p.dataHistoryDays
      })))
    });
  }

  upgrade(planName: string) {
    this.upgrading.set(true);
    this.subscriptionService.upgradePlan(planName).subscribe({
      next: () => {
        this.loadData();
        this.showPlans.set(false);
        this.upgrading.set(false);
      },
      error: () => this.upgrading.set(false)
    });
  }
}