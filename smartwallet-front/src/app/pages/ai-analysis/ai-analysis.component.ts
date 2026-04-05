import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, RiskMetrics, ScoreMetrics, Recommendation } from '../../services/api.service';

@Component({
  selector: 'app-ai-analysis',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-900">
      <!-- Header -->
      <header class="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <h1 class="text-2xl font-bold text-white">SmartWallet</h1>
        </div>
      </header>

      <!-- Navigation -->
      <nav class="bg-gray-800/50 border-b border-gray-700 px-6">
        <div class="max-w-7xl mx-auto flex gap-6">
          <a routerLink="/dashboard" class="py-4 px-2 text-gray-400 hover:text-white transition-colors">Dashboard</a>
          <a routerLink="/assets" class="py-4 px-2 text-gray-400 hover:text-white transition-colors">Ativos</a>
          <a routerLink="/ai" class="py-4 px-2 text-blue-400 border-b-2 border-blue-400 font-medium">Análise IA</a>
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
        } @else {
          <!-- Overall Score -->
          <div class="bg-gray-800 rounded-xl p-8 border border-gray-700 mb-8 text-center">
            <h2 class="text-gray-400 text-lg mb-4">Score Geral da Carteira</h2>
            <div class="inline-flex items-center justify-center w-32 h-32 rounded-full border-4" 
                 [class]="getScoreColor(score()?.overallScore || 0)">
              <span class="text-4xl font-bold text-white">{{ score()?.overallScore || 0 }}</span>
            </div>
            <p class="text-gray-400 mt-4">_análise completa baseada em diversificação, risco e desempenho</p>
          </div>

          <!-- Risk Metrics -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p class="text-gray-400 text-sm mb-2">Volatilidade</p>
              <p class="text-2xl font-bold text-white">{{ risk()?.portfolioVolatility | number:'1.2-2' }}%</p>
            </div>
            <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p class="text-gray-400 text-sm mb-2">Sharpe Ratio</p>
              <p class="text-2xl font-bold text-white">{{ risk()?.sharpeRatio | number:'1.2-2' }}</p>
            </div>
            <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p class="text-gray-400 text-sm mb-2">Beta</p>
              <p class="text-2xl font-bold text-white">{{ risk()?.beta | number:'1.2-2' }}</p>
            </div>
            <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p class="text-gray-400 text-sm mb-2">Max Drawdown</p>
              <p class="text-2xl font-bold text-red-400">-{{ risk()?.maxDrawdown | number:'1.2-2' }}%</p>
            </div>
            <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p class="text-gray-400 text-sm mb-2">VaR 95%</p>
              <p class="text-2xl font-bold text-red-400">{{ risk()?.var95 | number:'1.2-2' }}%</p>
            </div>
            <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p class="text-gray-400 text-sm mb-2">Nível de Risco</p>
              <p class="text-2xl font-bold" [class]="getRiskColor(risk()?.riskLevel || '')">
                {{ getRiskLabel(risk()?.riskLevel || '') }}
              </p>
            </div>
          </div>

          <!-- Score Breakdown -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 class="text-lg font-semibold text-white mb-4">Pontuação por Critério</h3>
              <div class="space-y-4">
                <div>
                  <div class="flex justify-between text-gray-300 mb-1">
                    <span>Diversificação</span>
                    <span>{{ score()?.diversificationScore }}/50</span>
                  </div>
                  <div class="h-2 bg-gray-700 rounded-full">
                    <div class="h-2 bg-blue-500 rounded-full" [style.width.%]="(score()?.diversificationScore || 0) * 2"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-gray-300 mb-1">
                    <span>Risco/Retorno</span>
                    <span>{{ score()?.riskReturnScore }}/80</span>
                  </div>
                  <div class="h-2 bg-gray-700 rounded-full">
                    <div class="h-2 bg-green-500 rounded-full" [style.width.%]="(score()?.riskReturnScore || 0) / 0.8"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-gray-300 mb-1">
                    <span>Liquidez</span>
                    <span>{{ score()?.liquidityScore }}/50</span>
                  </div>
                  <div class="h-2 bg-gray-700 rounded-full">
                    <div class="h-2 bg-yellow-500 rounded-full" [style.width.%]="(score()?.liquidityScore || 0) * 2"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-gray-300 mb-1">
                    <span>Concentração</span>
                    <span>{{ score()?.concentrationScore }}/100</span>
                  </div>
                  <div class="h-2 bg-gray-700 rounded-full">
                    <div class="h-2 bg-purple-500 rounded-full" [style.width.%]="score()?.concentrationScore"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-gray-300 mb-1">
                    <span>Estabilidade</span>
                    <span>{{ score()?.stabilityScore }}/100</span>
                  </div>
                  <div class="h-2 bg-gray-700 rounded-full">
                    <div class="h-2 bg-cyan-500 rounded-full" [style.width.%]="score()?.stabilityScore"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recommendations -->
            <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 class="text-lg font-semibold text-white mb-4">Recomendações</h3>
              <div class="space-y-3">
                @for (rec of recommendations(); track rec.title) {
                  <div class="p-4 bg-gray-700/50 rounded-lg border-l-4" [class]="getRecTypeColor(rec.type)">
                    <h4 class="text-white font-medium">{{ rec.title }}</h4>
                    <p class="text-gray-400 text-sm mt-1">{{ rec.description }}</p>
                    <p class="text-blue-400 text-sm mt-2">{{ rec.actionRequired }}</p>
                  </div>
                }
                @if (recommendations().length === 0) {
                  <p class="text-gray-500 text-center py-4">Nenhuma recomendação no momento</p>
                }
              </div>
            </div>
          </div>

          <!-- Recommendations from Score -->
          @if (score()?.recommendations?.length) {
            <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 class="text-lg font-semibold text-white mb-4">Melhorias Sugeridas</h3>
              <ul class="space-y-2">
                @for (rec of score()?.recommendations; track rec) {
                  <li class="flex items-center text-gray-300">
                    <span class="text-blue-400 mr-2">•</span>
                    {{ rec }}
                  </li>
                }
              </ul>
            </div>
          }
        }
      </main>
    </div>
  `
})
export class AiAnalysisComponent implements OnInit {
  api = inject(ApiService);

  loading = signal(true);
  risk = signal<RiskMetrics | null>(null);
  score = signal<ScoreMetrics | null>(null);
  recommendations = signal<Recommendation[]>([]);

  ngOnInit() {
    this.loadAnalysis();
  }

  loadAnalysis() {
    this.loading.set(true);

    this.api.getRiskMetrics().subscribe({
      next: (data) => this.risk.set(data),
      error: () => {}
    });

    this.api.getPortfolioScore().subscribe({
      next: (data) => this.score.set(data),
      error: () => {}
    });

    this.api.getRecommendations().subscribe({
      next: (data) => {
        this.recommendations.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getScoreColor(score: number): string {
    if (score >= 70) return 'border-green-500 bg-green-500/20';
    if (score >= 50) return 'border-yellow-500 bg-yellow-500/20';
    return 'border-red-500 bg-red-500/20';
  }

  getRiskColor(level: string): string {
    switch (level) {
      case 'VERY_LOW': return 'text-green-400';
      case 'LOW': return 'text-green-300';
      case 'MODERATE': return 'text-yellow-400';
      case 'HIGH': return 'text-orange-400';
      case 'VERY_HIGH': return 'text-red-400';
      default: return 'text-gray-400';
    }
  }

  getRiskLabel(level: string): string {
    switch (level) {
      case 'VERY_LOW': return 'Muito Baixo';
      case 'LOW': return 'Baixo';
      case 'MODERATE': return 'Moderado';
      case 'HIGH': return 'Alto';
      case 'VERY_HIGH': return 'Muito Alto';
      default: return 'N/A';
    }
  }

  getRecTypeColor(type: string): string {
    switch (type) {
      case 'BUY_OPPORTUNITY': return 'border-green-500';
      case 'SELL_WARNING': return 'border-red-500';
      case 'DIVERSIFY': return 'border-blue-500';
      case 'REDUCE_RISK': return 'border-orange-500';
      default: return 'border-gray-500';
    }
  }
}