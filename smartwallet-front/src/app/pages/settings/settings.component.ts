import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="settings-page">
      <section class="settings-hero">
        <div>
          <span class="eyebrow">Configuracoes</span>
          <h1>Preferencias da Smartwallet</h1>
          <p>Ajuste alertas, perfil de risco e comportamento da sua conta.</p>
        </div>
        <a routerLink="/profile" class="hero-link">
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">person</span>
          Perfil
        </a>
      </section>

      <section class="settings-grid">
        <article class="settings-card">
          <div class="card-heading">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">psychology</span>
            <div>
              <h2>Perfil de risco</h2>
              <p>Usado para personalizar recomendacoes e alertas.</p>
            </div>
          </div>

          <div class="risk-summary">
            <small>Perfil atual</small>
            <strong>{{ riskProfile }}</strong>
            <p>{{ riskDescription }}</p>
          </div>

          <div class="setting-row">
            <span>Pontuacao da pesquisa</span>
            <strong>{{ riskScoreLabel }}</strong>
          </div>

          <a class="primary-action" routerLink="/calculators">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">edit_note</span>
            Refazer pesquisa
          </a>
        </article>

        <article class="settings-card">
          <div class="card-heading">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">notifications_active</span>
            <div>
              <h2>Alertas</h2>
              <p>Controle os canais que receberao novidades da carteira.</p>
            </div>
          </div>

          <label class="field">
            WhatsApp
            <input type="tel" [(ngModel)]="whatsappPhone" placeholder="+55 11 99999-9999" />
          </label>

          <label class="toggle-row">
            <span>Alertas de compra</span>
            <input type="checkbox" [(ngModel)]="whatsappBuyAlerts" />
          </label>

          <label class="toggle-row">
            <span>IA conectada ao WhatsApp</span>
            <input type="checkbox" [(ngModel)]="whatsappAiBridge" />
          </label>

          <button class="primary-action" type="button" (click)="savePreferences()">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">save</span>
            {{ saved ? 'Salvo' : 'Salvar preferencias' }}
          </button>
        </article>

        <article class="settings-card">
          <div class="card-heading">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">palette</span>
            <div>
              <h2>Aparencia</h2>
              <p>Preferencia visual usada nas proximas telas.</p>
            </div>
          </div>

          <div class="segmented-control" role="group" aria-label="Tema">
            <button type="button" [class.active]="theme === 'auto'" (click)="theme = 'auto'">Auto</button>
            <button type="button" [class.active]="theme === 'dark'" (click)="theme = 'dark'">Escuro</button>
            <button type="button" [class.active]="theme === 'light'" (click)="theme = 'light'">Claro</button>
          </div>

          <button class="secondary-action" type="button" (click)="saveTheme()">
            Aplicar tema
          </button>
        </article>
      </section>
    </div>
  `,
  styles: [`
    .settings-page {
      min-height: 100%;
      display: grid;
      gap: 18px;
      padding: 28px;
      color: #0f172a;
    }

    h1,
    h2,
    p {
      margin: 0;
    }

    .settings-hero {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      padding: 24px;
      border: 1px solid rgba(14, 165, 233, 0.18);
      border-radius: 24px;
      background:
        radial-gradient(circle at 10% 0%, rgba(14, 165, 233, 0.18), transparent 34%),
        linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(240, 249, 255, 0.86));
      box-shadow: 0 22px 60px rgba(15, 23, 42, 0.1);
    }

    .eyebrow {
      display: block;
      margin-bottom: 8px;
      color: #0369a1;
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
    }

    .settings-hero h1 {
      font-size: 34px;
      line-height: 1;
    }

    .settings-hero p,
    .card-heading p,
    .risk-summary p {
      margin-top: 8px;
      color: #53617a;
      font-size: 14px;
    }

    .hero-link,
    .primary-action,
    .secondary-action {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 0;
      border-radius: 14px;
      padding: 0 16px;
      color: #fff;
      font-weight: 900;
      text-decoration: none;
      cursor: pointer;
      background: linear-gradient(145deg, #0284c7, #0f766e);
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 18px;
    }

    .settings-card {
      display: grid;
      align-content: start;
      gap: 16px;
      padding: 22px;
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 22px;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
    }

    .card-heading {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .card-heading > .material-symbols-rounded {
      width: 46px;
      height: 46px;
      display: grid;
      place-items: center;
      border-radius: 15px;
      color: #0369a1;
      background: rgba(14, 165, 233, 0.12);
    }

    .card-heading h2 {
      font-size: 20px;
    }

    .risk-summary {
      padding: 16px;
      border: 1px solid rgba(14, 165, 233, 0.18);
      border-radius: 18px;
      background: rgba(240, 249, 255, 0.74);
    }

    .risk-summary small {
      color: #0369a1;
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
    }

    .risk-summary strong {
      display: block;
      margin-top: 4px;
      font-size: 24px;
    }

    .setting-row,
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 14px 0;
      border-bottom: 1px solid rgba(148, 163, 184, 0.16);
    }

    .setting-row span,
    .toggle-row span,
    .field {
      color: #64748b;
      font-size: 13px;
      font-weight: 800;
    }

    .setting-row strong {
      font-size: 14px;
    }

    .field {
      display: grid;
      gap: 8px;
    }

    .field input {
      width: 100%;
      min-height: 44px;
      border: 1px solid rgba(14, 165, 233, 0.22);
      border-radius: 14px;
      padding: 0 14px;
      color: #0f172a;
      background: rgba(255, 255, 255, 0.92);
      outline: 0;
    }

    .toggle-row input {
      width: 20px;
      height: 20px;
      accent-color: #0ea5e9;
    }

    .segmented-control {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      padding: 6px;
      border-radius: 16px;
      background: rgba(226, 232, 240, 0.76);
    }

    .segmented-control button {
      min-height: 38px;
      border: 0;
      border-radius: 12px;
      color: #475569;
      font-weight: 900;
      background: transparent;
      cursor: pointer;
    }

    .segmented-control button.active {
      color: #fff;
      background: linear-gradient(145deg, #0284c7, #0f766e);
    }

    .secondary-action {
      color: #0f172a;
      background: rgba(226, 232, 240, 0.84);
    }

    @media (prefers-color-scheme: dark) {
      .settings-page {
        color: #f8fafc;
      }

      .settings-hero,
      .settings-card {
        border-color: rgba(14, 165, 233, 0.24);
        background:
          radial-gradient(circle at 18% 0%, rgba(14, 165, 233, 0.2), transparent 38%),
          rgba(13, 15, 40, 0.9);
      }

      .settings-hero p,
      .card-heading p,
      .risk-summary p,
      .setting-row span,
      .toggle-row span,
      .field {
        color: #b8c1dd;
      }

      .risk-summary,
      .segmented-control,
      .secondary-action {
        background: rgba(10, 14, 38, 0.76);
      }

      .field input {
        color: #f8fafc;
        background: rgba(2, 6, 18, 0.76);
      }

      .secondary-action {
        color: #f8fafc;
      }
    }

    @media (max-width: 980px) {
      .settings-grid {
        grid-template-columns: 1fr;
      }

      .settings-hero {
        align-items: start;
        flex-direction: column;
      }

      .hero-link {
        width: 100%;
      }
    }

    @media (max-width: 680px) {
      .settings-page {
        padding: 18px;
      }
    }
  `]
})
export class SettingsComponent {
  private readonly riskStorageKey = 'smartwallet-risk-profile';
  private readonly whatsappStorageKey = 'smartwallet-whatsapp-alerts';
  private readonly themeStorageKey = 'smartwallet-theme';

  protected riskProfile = 'Nao definido';
  protected riskDescription = 'Responda a pesquisa nas calculadoras para personalizar alertas e recomendacoes.';
  protected riskScoreLabel = '-';
  protected whatsappPhone = '';
  protected whatsappBuyAlerts = true;
  protected whatsappAiBridge = true;
  protected theme: 'auto' | 'dark' | 'light' = 'auto';
  protected saved = false;

  constructor() {
    this.loadRiskProfile();
    this.loadPreferences();
  }

  protected savePreferences(): void {
    localStorage.setItem(this.whatsappStorageKey, JSON.stringify({
      phone: this.whatsappPhone,
      buyAlerts: this.whatsappBuyAlerts,
      aiBridge: this.whatsappAiBridge,
      updatedAt: new Date().toISOString()
    }));
    this.saved = true;
  }

  protected saveTheme(): void {
    localStorage.setItem(this.themeStorageKey, this.theme);
    this.saved = true;
  }

  private loadRiskProfile(): void {
    const savedProfile = localStorage.getItem(this.riskStorageKey);
    if (!savedProfile) {
      return;
    }

    try {
      const parsed = JSON.parse(savedProfile) as { profile?: string; description?: string; score?: number };
      this.riskProfile = parsed.profile || this.riskProfile;
      this.riskDescription = parsed.description || this.riskDescription;
      this.riskScoreLabel = parsed.score ? `${parsed.score} / 24` : this.riskScoreLabel;
    } catch {
      localStorage.removeItem(this.riskStorageKey);
    }
  }

  private loadPreferences(): void {
    const savedPreferences = localStorage.getItem(this.whatsappStorageKey);
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences) as { phone?: string; buyAlerts?: boolean; aiBridge?: boolean };
        this.whatsappPhone = parsed.phone || '';
        this.whatsappBuyAlerts = parsed.buyAlerts ?? true;
        this.whatsappAiBridge = parsed.aiBridge ?? true;
      } catch {
        localStorage.removeItem(this.whatsappStorageKey);
      }
    }

    const savedTheme = localStorage.getItem(this.themeStorageKey);
    if (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'auto') {
      this.theme = savedTheme;
    }
  }
}
