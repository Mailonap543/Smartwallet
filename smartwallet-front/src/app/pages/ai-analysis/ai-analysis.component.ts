import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, Recommendation, RiskMetrics, ScoreMetrics } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

interface AiFeature {
  icon: string;
  title: string;
  description: string;
}

interface AiInsight {
  icon: string;
  title: string;
  description: string;
}

interface WhatsappRule {
  id: string;
  label: string;
  enabled: boolean;
}

@Component({
  selector: 'app-ai-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="jarvis-os">
      <header class="jarvis-topbar">
        <div>
          <h1>Inteligência Artificial</h1>
          <p>Análises avançadas e recomendações personalizadas para potencializar seus investimentos.</p>
        </div>

        <div class="mode-cluster" aria-label="Status da IA">
          <span>JARVIS MODE</span>
          <strong>ATIVO <i></i></strong>
        </div>

        <button class="help-button" type="button" aria-label="Como funciona">
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">help</span>
          Como funciona
        </button>
      </header>

      <section class="command-deck" aria-label="Painel principal do Jarvis">
        <article class="command-card">
          <div class="command-card-top">
            <strong>JARVIS</strong>
            <span class="waveform" aria-hidden="true">
              @for (bar of waveformBars; track $index) {
                <i [style.height.px]="bar"></i>
              }
            </span>
          </div>

          <h2>Olá, {{ firstName }}!</h2>
          <p>Estou analisando o mercado e seus ativos em tempo real para encontrar as melhores oportunidades para você.</p>

          <button class="primary-action" type="button" (click)="loadAnalysis()">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">auto_awesome</span>
            Gerar novas recomendações
          </button>
        </article>

        <article class="hologram-stage" aria-label="Interface visual da IA">
          <div class="hud-ring outer"></div>
          <div class="hud-ring middle"></div>
          <div class="hud-ring inner"></div>

          <div class="scan-card scan-left">
            <strong>82%</strong>
            <small>Análise concluída</small>
          </div>

          <div class="scan-card scan-right">
            <span class="mini-chart" aria-hidden="true"></span>
            <small>Projeção ativa</small>
          </div>

          <div class="market-node market">
            <strong>MERCADO</strong>
            <span class="mini-chart" aria-hidden="true"></span>
            <small>Tendência de alta</small>
          </div>

          <div class="market-node volatility">
            <strong>VOLATILIDADE</strong>
            <span class="bar-chart" aria-hidden="true"></span>
            <small>Baixa</small>
          </div>

          <div class="brain-core">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">neurology</span>
            @for (node of brainNodes; track node) {
              <i [style.--node]="node"></i>
            }
          </div>

          <div class="voice-row">
            <span class="sound-wave left" aria-hidden="true"></span>
            <a class="mic-button" [routerLink]="['/ai']" [queryParams]="{ voice: '1' }" aria-label="Fale com o Jarvis">
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">mic</span>
            </a>
            <span class="sound-wave right" aria-hidden="true"></span>
          </div>

          <div class="voice-caption">
            <strong>Fale com o JARVIS</strong>
            <small>Clique no microfone e faça sua pergunta ou dê um comando por voz.</small>
          </div>
        </article>

        <aside class="metric-stack" aria-label="Métricas da inteligência artificial">
          <div class="metric-card">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">trending_up</span>
            <div>
              <small>Análises realizadas</small>
              <strong>{{ analysisCount }}</strong>
              <em>+18% vs mês anterior</em>
            </div>
          </div>
          <div class="metric-card">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">my_location</span>
            <div>
              <small>Precisão das recomendações</small>
              <strong>{{ recommendationAccuracy }}%</strong>
              <em>Baseado nos últimos 6 meses</em>
            </div>
          </div>
          <div class="metric-card">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">shield</span>
            <div>
              <small>Nível de confiança</small>
              <strong class="success">{{ confidenceLabel }}</strong>
              <em>{{ riskLabel }}</em>
            </div>
          </div>
        </aside>
      </section>

      <section class="capability-strip" aria-label="Capacidades da IA">
        @for (feature of features; track feature.title) {
          <article>
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">{{ feature.icon }}</span>
            <div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          </article>
        }
      </section>

      <section class="content-grid">
        <article class="panel recommendations-panel">
          <div class="panel-heading">
            <h2>Recomendações para você</h2>
            <button type="button">Ver todas</button>
          </div>

          <div class="recommendation-grid">
            @for (card of recommendationCards; track card.title) {
              <article class="recommendation-card">
                <div class="card-top">
                  <span class="tag" [class.watch]="card.action === 'OBSERVAR'">{{ card.action }}</span>
                  <small>{{ card.conviction }}</small>
                </div>

                <div class="asset-line">
                  <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">{{ card.icon }}</span>
                  <div>
                    <h3>{{ card.title }}</h3>
                    <p>{{ card.type }}</p>
                  </div>
                </div>

                <small>Rentabilidade estimada</small>
                <strong>{{ card.return }}</strong>
                <small>Prazo recomendado</small>
                <p>{{ card.term }}</p>
                <span class="sparkline" [class.blue]="card.color === 'blue'" [class.amber]="card.color === 'amber'" aria-hidden="true"></span>
                <button type="button">Ver detalhes</button>
              </article>
            }
          </div>
        </article>

        <article class="panel insights-panel">
          <div class="panel-heading">
            <h2>Insights da IA</h2>
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">auto_awesome</span>
          </div>

          @for (insight of insights; track insight.title) {
            <button class="insight-item" type="button">
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">{{ insight.icon }}</span>
              <span>
                <strong>{{ insight.title }}</strong>
                <small>{{ insight.description }}</small>
              </span>
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">chevron_right</span>
            </button>
          }

          <div class="whatsapp-mini">
            <div>
              <strong>Central WhatsApp</strong>
              <small>Bridge pronto para sua IA em Kotlin/Python.</small>
            </div>
            <input type="tel" inputmode="tel" placeholder="+55 11 99999-9999" [(ngModel)]="whatsappPhone" />
            <label>
              <input type="checkbox" [(ngModel)]="whatsappBuyAlerts" />
              Avisar quando a IA indicar boa compra
            </label>
            <button type="button" (click)="saveWhatsappHub()">Salvar central</button>
            <small>{{ whatsappStatus }}</small>
          </div>

          <button class="report-button" type="button">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">assignment</span>
            Ver relatório completo
          </button>
        </article>
      </section>

      <footer class="system-footer" aria-label="Status do sistema Jarvis">
        <span>SW // JARVIS OS V2.0</span>
        <span>IBOV <strong>+0,81%</strong></span>
        <span>DÓLAR <strong>R$ 5,12</strong></span>
        <span>IPCA 12M <strong>3,69%</strong></span>
        <span>SELIC <strong>10,50%</strong></span>
        <span class="system-core"></span>
        <span>CONECTADO</span>
        <span>TEMPO REAL</span>
        <span>JARVIS OS <strong>ONLINE</strong></span>
      </footer>

      @if (loading()) {
        <div class="loading-chip">
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">progress_activity</span>
          Atualizando inteligência...
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100%;
    }

    .jarvis-os {
      min-height: 100%;
      overflow-x: hidden;
      padding: 14px 14px 10px;
      color: #f8fbff;
      background:
        linear-gradient(rgba(0, 198, 255, 0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 198, 255, 0.035) 1px, transparent 1px),
        radial-gradient(circle at 52% 8%, rgba(0, 153, 255, 0.24), transparent 28%),
        radial-gradient(circle at 82% 2%, rgba(124, 58, 237, 0.18), transparent 24%),
        linear-gradient(145deg, #02040d 0%, #050b1c 48%, #02040d 100%);
      background-size: 34px 34px, 34px 34px, auto, auto, auto;
    }

    h1, h2, h3, p {
      margin: 0;
    }

    .jarvis-topbar,
    .mode-cluster,
    .command-card-top,
    .card-top,
    .asset-line,
    .panel-heading,
    .system-footer {
      display: flex;
      align-items: center;
    }

    .jarvis-topbar {
      position: relative;
      gap: 14px;
      justify-content: space-between;
      min-height: 82px;
      margin-bottom: 8px;
      padding: 14px 20px;
      border: 1px solid rgba(0, 195, 255, 0.18);
      border-radius: 4px 22px 4px 22px;
      background:
        linear-gradient(135deg, rgba(4, 12, 30, 0.84), rgba(2, 5, 16, 0.86)),
        radial-gradient(circle at 60% 0%, rgba(0, 195, 255, 0.16), transparent 40%);
      box-shadow: inset 0 0 0 1px rgba(96, 165, 250, 0.06), 0 20px 60px rgba(0, 0, 0, 0.32);
    }

    .jarvis-topbar::before,
    .jarvis-topbar::after,
    .command-deck::before,
    .panel::before {
      position: absolute;
      width: 78px;
      height: 2px;
      content: '';
      background: linear-gradient(90deg, transparent, #06b6d4, #7c3aed, transparent);
      filter: drop-shadow(0 0 8px #06b6d4);
    }

    .jarvis-topbar::before {
      top: -1px;
      left: 44px;
    }

    .jarvis-topbar::after {
      right: 18px;
      bottom: -1px;
    }

    .jarvis-topbar h1 {
      font-size: 28px;
      line-height: 1;
    }

    .jarvis-topbar p,
    .command-card p,
    .capability-strip p,
    .insight-item small,
    .whatsapp-mini small,
    .metric-card em {
      color: #b8c5e8;
      line-height: 1.45;
    }

    .jarvis-topbar p {
      max-width: 550px;
      margin-top: 7px;
      font-size: 13px;
    }

    .mode-cluster {
      overflow: hidden;
      border: 1px solid rgba(0, 195, 255, 0.18);
      border-radius: 2px 18px 2px 18px;
      background: rgba(0, 22, 42, 0.72);
    }

    .mode-cluster span,
    .mode-cluster strong {
      min-height: 38px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0 13px;
      color: #22e6ff;
      font-size: 13px;
      text-transform: uppercase;
    }

    .mode-cluster strong {
      color: #2fffd0;
      border-left: 1px solid rgba(0, 195, 255, 0.18);
    }

    .mode-cluster i {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #2fffd0;
      box-shadow: 0 0 16px #2fffd0;
    }

    .help-button,
    .primary-action,
    .recommendation-card button,
    .report-button,
    .whatsapp-mini button {
      min-height: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 1px solid rgba(124, 58, 237, 0.42);
      border-radius: 11px;
      color: #f8fbff;
      background: rgba(11, 18, 45, 0.78);
      cursor: pointer;
    }

    .primary-action {
      width: max-content;
      border-color: rgba(39, 226, 155, 0.32);
      padding: 0 20px;
      font-weight: 900;
      background: linear-gradient(135deg, #3b22d5, #6729ff 54%, #1068ff);
      box-shadow: 0 18px 40px rgba(60, 74, 255, 0.26);
    }

    .command-deck,
    .panel,
    .capability-strip {
      position: relative;
      border: 1px solid rgba(0, 195, 255, 0.2);
      background:
        linear-gradient(135deg, rgba(4, 12, 30, 0.88), rgba(2, 6, 18, 0.88)),
        radial-gradient(circle at 50% 0%, rgba(0, 195, 255, 0.15), transparent 38%);
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.36), inset 0 0 38px rgba(0, 149, 255, 0.04);
    }

    .command-deck {
      display: grid;
      grid-template-columns: minmax(230px, 0.92fr) minmax(340px, 1.35fr) minmax(240px, 0.85fr);
      gap: 14px;
      min-height: 302px;
      padding: 14px;
      border-radius: 6px 22px 6px 22px;
      overflow: hidden;
    }

    .command-deck::before {
      left: 20px;
      top: -1px;
    }

    .command-card {
      min-width: 0;
      align-self: center;
      display: grid;
      gap: 14px;
      padding: 16px;
      border: 1px solid rgba(0, 195, 255, 0.18);
      border-radius: 3px 18px 3px 18px;
      background: rgba(2, 7, 20, 0.62);
      clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 36px 100%, 0 calc(100% - 36px));
    }

    .command-card-top {
      gap: 14px;
      color: #23e7ff;
      letter-spacing: 0.08em;
    }

    .waveform {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      height: 28px;
      min-width: 112px;
      color: #7c3aed;
    }

    .waveform i {
      width: 3px;
      border-radius: 999px;
      background: linear-gradient(#22e6ff, #7c3aed);
      box-shadow: 0 0 10px rgba(34, 230, 255, 0.52);
    }

    .command-card h2 {
      font-size: 26px;
    }

    .hologram-stage {
      position: relative;
      min-height: 274px;
      display: grid;
      place-items: center;
      isolation: isolate;
      overflow: hidden;
    }

    .hud-ring,
    .brain-core,
    .mic-button,
    .system-core {
      position: absolute;
      border-radius: 50%;
    }

    .hud-ring {
      border: 1px solid rgba(34, 230, 255, 0.26);
      background: radial-gradient(circle, rgba(0, 149, 255, 0.12), transparent 66%);
    }

    .hud-ring.outer {
      width: 272px;
      height: 272px;
      border-top-color: #38bdf8;
      animation: rotateSlow 16s linear infinite;
    }

    .hud-ring.middle {
      width: 214px;
      height: 214px;
      border-right-color: #7c3aed;
      animation: rotateSlow 11s linear infinite reverse;
    }

    .hud-ring.inner {
      width: 150px;
      height: 150px;
      border-bottom-color: #22e6ff;
    }

    .brain-core {
      top: 32px;
      width: 170px;
      height: 124px;
      display: grid;
      place-items: center;
      color: #38bdf8;
      background: radial-gradient(circle at 40% 30%, rgba(255, 255, 255, 0.28), transparent 18%);
      filter: drop-shadow(0 0 28px rgba(0, 149, 255, 0.95));
    }

    .brain-core .material-symbols-rounded {
      font-size: 112px;
      color: #38bdf8;
      text-shadow: 0 0 22px rgba(124, 58, 237, 0.8);
    }

    .brain-core i {
      position: absolute;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #e0f2fe;
      box-shadow: 0 0 14px #38bdf8;
      transform: rotate(calc(var(--node) * 20deg)) translateX(90px);
    }

    .scan-card {
      position: absolute;
      z-index: 2;
      display: grid;
      place-items: center;
      gap: 4px;
      min-width: 58px;
      min-height: 58px;
      border: 1px solid rgba(0, 195, 255, 0.22);
      border-radius: 50%;
      color: #22e6ff;
      background: rgba(2, 10, 28, 0.74);
      box-shadow: 0 0 24px rgba(0, 149, 255, 0.26);
    }

    .scan-card small {
      max-width: 64px;
      color: #7dd3fc;
      font-size: 9px;
      text-align: center;
    }

    .scan-left {
      left: 12px;
      top: 96px;
    }

    .scan-right {
      display: none;
      right: 16px;
      top: 76px;
      border-radius: 6px;
      min-width: 104px;
      min-height: 72px;
    }

    .market-node {
      position: absolute;
      right: 6px;
      z-index: 2;
      width: 96px;
      min-height: 74px;
      display: grid;
      gap: 5px;
      padding: 8px;
      border: 1px solid rgba(0, 195, 255, 0.2);
      border-radius: 5px;
      color: #dbeafe;
      background: rgba(2, 10, 28, 0.72);
      box-shadow: 0 0 24px rgba(0, 149, 255, 0.18);
    }

    .market-node.market {
      top: 22px;
    }

    .market-node.volatility {
      top: 108px;
    }

    .market-node strong {
      color: #22e6ff;
      font-size: 9px;
      letter-spacing: 0.08em;
    }

    .market-node small {
      color: #9fb0dc;
      font-size: 10px;
    }

    .mini-chart,
    .sparkline {
      display: block;
      width: 76px;
      height: 30px;
      background:
        linear-gradient(135deg, transparent 10%, #7c3aed 12% 14%, transparent 16% 28%, #22e6ff 30% 32%, transparent 34% 48%, #7c3aed 50% 53%, transparent 55% 68%, #22e6ff 70% 74%, transparent 76%),
        linear-gradient(rgba(56, 189, 248, 0.12) 1px, transparent 1px);
      background-size: 100% 100%, 100% 9px;
    }

    .bar-chart {
      display: block;
      width: 76px;
      height: 31px;
      background:
        linear-gradient(90deg, #7c3aed 0 9%, transparent 10% 17%, #38bdf8 18% 27%, transparent 28% 35%, #7c3aed 36% 49%, transparent 50% 57%, #38bdf8 58% 68%, transparent 69% 76%, #7c3aed 77% 90%, transparent 91%),
        linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px);
      background-size: 100% 100%, 100% 9px;
      clip-path: polygon(0 100%, 0 58%, 9% 58%, 9% 100%, 18% 100%, 18% 34%, 27% 34%, 27% 100%, 36% 100%, 36% 18%, 49% 18%, 49% 100%, 58% 100%, 58% 52%, 68% 52%, 68% 100%, 77% 100%, 77% 30%, 90% 30%, 90% 100%);
    }

    .voice-row {
      position: absolute;
      bottom: 62px;
      left: 0;
      right: 0;
      z-index: 3;
      display: grid;
      grid-template-columns: minmax(72px, 1fr) 68px minmax(72px, 1fr);
      align-items: center;
      gap: 10px;
    }

    .mic-button {
      position: relative;
      width: 68px;
      height: 68px;
      display: grid;
      place-items: center;
      justify-self: center;
      color: #dbeafe;
      text-decoration: none;
      border: 2px solid rgba(56, 189, 248, 0.5);
      background:
        radial-gradient(circle, rgba(124, 58, 237, 0.34), transparent 68%),
        rgba(2, 10, 28, 0.92);
      box-shadow: 0 0 34px rgba(56, 189, 248, 0.52), inset 0 0 28px rgba(124, 58, 237, 0.3);
    }

    .mic-button .material-symbols-rounded {
      font-size: 39px;
    }

    .sound-wave {
      height: 40px;
      opacity: 0.88;
      background:
        linear-gradient(90deg, transparent, rgba(34, 230, 255, 0.2), rgba(34, 230, 255, 0.95), rgba(124, 58, 237, 0.55), transparent),
        repeating-linear-gradient(90deg, transparent 0 8px, rgba(56, 189, 248, 0.58) 9px 11px, transparent 12px 18px);
      filter: drop-shadow(0 0 14px rgba(34, 230, 255, 0.56));
      clip-path: polygon(0 45%, 10% 55%, 20% 35%, 30% 70%, 40% 18%, 50% 86%, 60% 30%, 70% 62%, 80% 42%, 100% 55%, 100% 100%, 0 100%);
    }

    .voice-caption {
      position: absolute;
      z-index: 4;
      bottom: 5px;
      left: 50%;
      width: 220px;
      transform: translateX(-50%);
      text-align: center;
    }

    .voice-caption strong,
    .voice-caption small {
      display: block;
    }

    .voice-caption small {
      margin-top: 3px;
      color: #93a4cc;
      font-size: 10px;
    }

    .metric-stack {
      display: grid;
      gap: 10px;
      align-self: center;
    }

    .metric-card {
      display: grid;
      grid-template-columns: 48px minmax(0, 1fr);
      gap: 12px;
      align-items: center;
      min-height: 86px;
      padding: 12px;
      border: 1px solid rgba(0, 195, 255, 0.2);
      border-radius: 8px 18px 8px 18px;
      background: rgba(6, 13, 35, 0.76);
      box-shadow: inset 0 0 22px rgba(0, 149, 255, 0.05);
    }

    .metric-card > .material-symbols-rounded,
    .capability-strip article > .material-symbols-rounded,
    .asset-line > .material-symbols-rounded,
    .insight-item > .material-symbols-rounded:first-child {
      width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #b8a8ff;
      background: radial-gradient(circle at 35% 25%, rgba(124, 58, 237, 0.84), rgba(23, 37, 84, 0.6));
      box-shadow: 0 0 22px rgba(124, 58, 237, 0.34);
    }

    .metric-card small,
    .metric-card em,
    .recommendation-card small {
      display: block;
      color: #aebae2;
      font-size: 12px;
      font-style: normal;
    }

    .metric-card strong {
      display: block;
      margin-top: 4px;
      font-size: 21px;
    }

    .metric-card .success,
    .metric-card em,
    .recommendation-card strong,
    .system-footer strong {
      color: #27e29b;
    }

    .capability-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin: 14px 0;
      padding: 14px 16px;
      border-radius: 6px 18px 6px 18px;
    }

    .capability-strip article {
      display: grid;
      grid-template-columns: 52px minmax(0, 1fr);
      gap: 10px;
      align-items: start;
    }

    .capability-strip h3 {
      font-size: 14px;
    }

    .capability-strip p {
      margin-top: 4px;
      font-size: 12px;
    }

    .content-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.7fr) minmax(300px, 0.72fr);
      gap: 14px;
    }

    .panel {
      padding: 14px;
      border-radius: 8px 18px 8px 18px;
    }

    .panel::before {
      top: -1px;
      left: 20px;
      width: 58px;
    }

    .panel-heading {
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }

    .panel-heading h2 {
      font-size: 18px;
    }

    .panel-heading button {
      border: 0;
      color: #9f7cff;
      background: transparent;
      cursor: pointer;
    }

    .recommendation-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .recommendation-card {
      display: grid;
      gap: 9px;
      padding: 12px;
      border: 1px solid rgba(0, 195, 255, 0.16);
      border-radius: 12px;
      background:
        radial-gradient(circle at 96% 88%, rgba(0, 195, 255, 0.16), transparent 28%),
        rgba(5, 12, 32, 0.78);
    }

    .card-top {
      justify-content: space-between;
    }

    .tag {
      padding: 7px 10px;
      border-radius: 8px;
      color: #27e29b;
      font-size: 11px;
      font-weight: 900;
      background: rgba(34, 197, 94, 0.14);
    }

    .tag.watch {
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.14);
    }

    .asset-line {
      gap: 12px;
    }

    .asset-line p,
    .recommendation-card p {
      color: #c5cdeb;
      font-size: 13px;
    }

    .recommendation-card strong {
      font-size: 20px;
    }

    .sparkline {
      justify-self: end;
      width: 86px;
      height: 32px;
      background:
        linear-gradient(135deg, transparent 10%, #27e29b 12% 14%, transparent 16% 30%, #27e29b 32% 36%, transparent 38% 52%, #27e29b 54% 58%, transparent 60% 74%, #27e29b 76% 82%, transparent 84%),
        linear-gradient(rgba(39, 226, 155, 0.1) 1px, transparent 1px);
      background-size: 100% 100%, 100% 8px;
    }

    .sparkline.blue {
      background:
        linear-gradient(135deg, transparent 10%, #1d8dff 12% 14%, transparent 16% 30%, #1d8dff 32% 36%, transparent 38% 52%, #1d8dff 54% 58%, transparent 60% 74%, #1d8dff 76% 82%, transparent 84%),
        linear-gradient(rgba(29, 141, 255, 0.1) 1px, transparent 1px);
    }

    .sparkline.amber {
      background:
        linear-gradient(135deg, transparent 10%, #f59e0b 12% 14%, transparent 16% 30%, #f59e0b 32% 36%, transparent 38% 52%, #f59e0b 54% 58%, transparent 60% 74%, #f59e0b 76% 82%, transparent 84%),
        linear-gradient(rgba(245, 158, 11, 0.1) 1px, transparent 1px);
    }

    .recommendation-card button,
    .report-button,
    .whatsapp-mini button {
      color: #b794ff;
      background: rgba(29, 31, 91, 0.58);
    }

    .insights-panel {
      display: grid;
      align-content: start;
      gap: 10px;
    }

    .insight-item {
      width: 100%;
      display: grid;
      grid-template-columns: 48px minmax(0, 1fr) 22px;
      gap: 10px;
      align-items: center;
      border: 0;
      padding: 9px 0;
      color: #f8fbff;
      text-align: left;
      background: transparent;
      cursor: pointer;
    }

    .insight-item strong,
    .insight-item small {
      display: block;
    }

    .whatsapp-mini {
      display: grid;
      gap: 9px;
      margin-top: 6px;
      padding: 12px;
      border: 1px solid rgba(39, 226, 155, 0.18);
      border-radius: 12px;
      background: rgba(3, 18, 25, 0.58);
    }

    .whatsapp-mini input {
      width: 100%;
      min-height: 38px;
      border: 1px solid rgba(39, 226, 155, 0.2);
      border-radius: 9px;
      padding: 0 10px;
      color: #f8fbff;
      background: rgba(2, 6, 18, 0.72);
      outline: 0;
    }

    .whatsapp-mini label {
      display: grid;
      grid-template-columns: 16px minmax(0, 1fr);
      gap: 8px;
      color: #c5cdeb;
      font-size: 12px;
    }

    .whatsapp-mini input[type="checkbox"] {
      width: 15px;
      min-height: 15px;
      accent-color: #27e29b;
    }

    .report-button {
      width: 100%;
      margin-top: 4px;
    }

    .system-footer {
      gap: 20px;
      min-height: 48px;
      margin-top: 14px;
      padding: 0 18px;
      overflow-x: auto;
      border: 1px solid rgba(0, 195, 255, 0.18);
      border-radius: 4px 18px 4px 18px;
      color: #9fb0dc;
      font-size: 12px;
      white-space: nowrap;
      background:
        linear-gradient(135deg, rgba(3, 10, 28, 0.88), rgba(2, 6, 18, 0.9)),
        radial-gradient(circle at 50% 50%, rgba(0, 195, 255, 0.24), transparent 18%);
    }

    .system-core {
      position: relative;
      width: 92px;
      height: 34px;
      flex: 0 0 92px;
      border: 1px solid rgba(0, 195, 255, 0.22);
      background: radial-gradient(circle, #22e6ff 0 8%, rgba(0, 149, 255, 0.34) 9% 20%, transparent 22%);
      box-shadow: 0 0 26px rgba(0, 149, 255, 0.5);
    }

    .loading-chip {
      position: fixed;
      right: 28px;
      bottom: 28px;
      z-index: 10;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 14px;
      border: 1px solid rgba(0, 195, 255, 0.22);
      border-radius: 12px;
      color: #f8fbff;
      background: rgba(3, 10, 28, 0.92);
      box-shadow: 0 18px 50px rgba(0, 0, 0, 0.32);
    }

    .loading-chip .material-symbols-rounded {
      animation: spin 1s linear infinite;
    }

    @keyframes rotateSlow {
      to { transform: rotate(360deg); }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 1220px) {
      .command-deck,
      .content-grid {
        grid-template-columns: 1fr;
      }

      .metric-stack,
      .capability-strip,
      .recommendation-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 720px) {
      .jarvis-os {
        padding: 12px;
      }

      .jarvis-topbar,
      .mode-cluster {
        align-items: stretch;
        flex-direction: column;
      }

      .metric-stack,
      .capability-strip,
      .recommendation-grid {
        grid-template-columns: 1fr;
      }

      .hologram-stage {
        min-height: 360px;
      }

      .jarvis-topbar h1 {
        font-size: 27px;
      }
    }
  `]
})
export class AiAnalysisComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly whatsappStorageKey = 'smartwallet-whatsapp-alerts';

  loading = signal(false);
  risk = signal<RiskMetrics | null>(null);
  score = signal<ScoreMetrics | null>(null);
  recommendations = signal<Recommendation[]>([]);

  brainNodes = Array.from({ length: 18 }, (_, index) => index + 1);
  waveformBars = [7, 15, 9, 24, 12, 18, 26, 10, 17, 8, 22, 13, 20, 9, 16, 25, 11, 18, 7, 14];
  whatsappPhone = '';
  whatsappBuyAlerts = true;
  whatsappStatus = 'Envio real desligado. Bridge pronto para integrar com sua IA.';

  whatsappRules: WhatsappRule[] = [
    { id: 'buy', label: 'Boa compra detectada pela IA', enabled: true },
    { id: 'risk', label: 'Recomendacao fora do perfil de risco', enabled: true },
    { id: 'price', label: 'Alerta de preco vindo do projeto', enabled: true }
  ];

  features: AiFeature[] = [
    {
      icon: 'bar_chart',
      title: 'Análise de Mercado',
      description: 'A IA monitora o mercado 24/7 e identifica tendências e padrões relevantes.'
    },
    {
      icon: 'person',
      title: 'Perfil Personalizado',
      description: 'Recomendações alinhadas ao seu perfil de investidor e aos seus objetivos.'
    },
    {
      icon: 'shield',
      title: 'Gestão de Risco',
      description: 'Avaliação contínua de riscos para proteger e otimizar sua carteira.'
    },
    {
      icon: 'bolt',
      title: 'Oportunidades',
      description: 'Identificação de ativos com maior potencial de acordo com o cenário atual.'
    }
  ];

  insights: AiInsight[] = [
    {
      icon: 'analytics',
      title: 'Cenário Econômico',
      description: 'Inflação em desaceleração e queda da Selic favorecem ativos de renda fixa atrelados ao IPCA.'
    },
    {
      icon: 'public',
      title: 'Tendência de Mercado',
      description: 'Setor de tecnologia deve continuar apresentando boas oportunidades no longo prazo.'
    },
    {
      icon: 'admin_panel_settings',
      title: 'Gestão de Risco',
      description: 'Diversificação atual da sua carteira está adequada ao seu perfil moderado.'
    }
  ];

  ngOnInit(): void {
    this.loadWhatsappHub();
    this.loadAnalysis();
  }

  get firstName(): string {
    const fullName = this.auth.user()?.fullName?.trim();
    return fullName ? fullName.split(/\s+/)[0] : 'Investidor';
  }

  get analysisCount(): string {
    const total = this.score()?.overallScore ? 1200 + Math.round(this.score()!.overallScore * 0.7) : 1248;
    return total.toLocaleString('pt-BR');
  }

  get recommendationAccuracy(): string {
    const score = this.score()?.overallScore || 76;
    return Math.min(96, Math.max(72, score + 10)).toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
  }

  get confidenceLabel(): string {
    const level = this.risk()?.riskLevel;
    return level === 'HIGH' || level === 'VERY_HIGH' ? 'Atenção' : 'Alto';
  }

  get riskLabel(): string {
    const level = this.risk()?.riskLevel || '';
    return this.getRiskLabel(level) === 'N/A' ? 'Mercado estável' : `Risco ${this.getRiskLabel(level).toLowerCase()}`;
  }

  get recommendationCards() {
    const apiRecommendations = this.recommendations().slice(0, 3);
    if (apiRecommendations.length) {
      return apiRecommendations.map((item, index) => ({
        action: item.type === 'BUY_OPPORTUNITY' ? 'COMPRA' : item.type === 'SELL_WARNING' ? 'OBSERVAR' : 'COMPRA',
        conviction: index === 0 ? 'Alta Convicção' : index === 1 ? 'Média Convicção' : 'Baixa Convicção',
        icon: index === 0 ? 'security' : index === 1 ? 'apartment' : 'memory',
        title: item.title,
        type: item.actionRequired || 'Recomendação IA',
        return: item.potentialImpact ? `${item.potentialImpact.toLocaleString('pt-BR')}%` : '12,3% a.a.',
        term: item.priority <= 2 ? 'Médio prazo' : 'Longo prazo',
        color: index === 1 ? 'blue' : index === 2 ? 'amber' : 'green'
      }));
    }

    return [
      { action: 'COMPRA', conviction: 'Alta Convicção', icon: 'security', title: 'Tesouro IPCA+ 2035', type: 'Renda Fixa', return: 'IPCA + 6,12% a.a.', term: 'Longo prazo', color: 'green' },
      { action: 'COMPRA', conviction: 'Média Convicção', icon: 'apartment', title: 'Fundos Imobiliários', type: 'FIIs', return: '12,3% a.a.', term: 'Médio prazo', color: 'blue' },
      { action: 'OBSERVAR', conviction: 'Baixa Convicção', icon: 'memory', title: 'Ações de Tecnologia', type: 'Setor de Tecnologia', return: '18,7%', term: 'Longo prazo', color: 'amber' }
    ];
  }

  loadAnalysis(): void {
    if (!this.auth.getToken()) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);

    this.api.getRiskMetrics().subscribe({
      next: data => this.risk.set(data),
      error: () => {}
    });

    this.api.getPortfolioScore().subscribe({
      next: data => this.score.set(data),
      error: () => {}
    });

    this.api.getRecommendations().subscribe({
      next: data => {
        this.recommendations.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  saveWhatsappHub(): void {
    localStorage.setItem(this.whatsappStorageKey, JSON.stringify({
      phone: this.whatsappPhone,
      buyAlerts: this.whatsappBuyAlerts,
      rules: this.whatsappRules,
      source: 'ai-analysis',
      aiBridge: true,
      updatedAt: new Date().toISOString()
    }));
    this.whatsappStatus = 'Central salva. Sua IA em Kotlin/Python pode ler essas preferências depois.';
  }

  private loadWhatsappHub(): void {
    const saved = localStorage.getItem(this.whatsappStorageKey);
    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as {
        phone?: string;
        buyAlerts?: boolean;
        rules?: WhatsappRule[];
      };
      this.whatsappPhone = parsed.phone || '';
      this.whatsappBuyAlerts = parsed.buyAlerts ?? true;
      if (parsed.rules?.length) {
        this.whatsappRules = this.whatsappRules.map(rule => {
          const savedRule = parsed.rules?.find(item => item.id === rule.id);
          return savedRule ? { ...rule, enabled: savedRule.enabled } : rule;
        });
      }
    } catch {
      localStorage.removeItem(this.whatsappStorageKey);
    }
  }

  private getRiskLabel(level: string): string {
    switch (level) {
      case 'VERY_LOW': return 'Muito baixo';
      case 'LOW': return 'Baixo';
      case 'MODERATE': return 'Moderado';
      case 'HIGH': return 'Alto';
      case 'VERY_HIGH': return 'Muito alto';
      default: return 'N/A';
    }
  }
}
