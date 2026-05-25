import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="profile-page">
      <section class="profile-hero">
        <div class="profile-avatar">{{ initials }}</div>
        <div class="profile-title">
          <span class="eyebrow">Perfil do usuario</span>
          <h1>{{ user()?.fullName || 'Seu perfil' }}</h1>
          <p>{{ user()?.email || 'Complete seus dados para personalizar sua experiencia.' }}</p>
        </div>
        <a class="hero-action" routerLink="/subscription" aria-label="Abrir plano">
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">workspace_premium</span>
          <span>Plano</span>
        </a>
      </section>

      <section class="profile-grid">
        <article class="profile-card account-card">
          <div class="card-heading">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">badge</span>
            <div>
              <h2>Dados da conta</h2>
              <p>Informacoes principais do usuario logado.</p>
            </div>
          </div>

          <dl class="info-list">
            <div>
              <dt>Nome</dt>
              <dd>{{ user()?.fullName || '-' }}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{{ user()?.email || '-' }}</dd>
            </div>
            <div>
              <dt>Perfil</dt>
              <dd>{{ user()?.role || 'USER' }}</dd>
            </div>
          </dl>
        </article>

        <article class="profile-card status-card">
          <div class="card-heading">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">shield_lock</span>
            <div>
              <h2>Seguranca</h2>
              <p>Sessao ativa e protegida por token.</p>
            </div>
          </div>

          <div class="status-pill">
            <span class="dot"></span>
            Conta autenticada
          </div>
          <button type="button" class="secondary-action" (click)="logout()">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">logout</span>
            Sair da conta
          </button>
        </article>

        <article class="profile-card preferences-card">
          <div class="card-heading">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">tune</span>
            <div>
              <h2>Preferencias</h2>
              <p>Preferencias usadas para personalizar alertas e recomendacoes.</p>
            </div>
          </div>

          <div class="risk-summary">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">psychology</span>
            <div>
              <small>Perfil de risco atual</small>
              <strong>{{ riskProfile }}</strong>
              <p>{{ riskDescription }}</p>
            </div>
          </div>

          <div class="preference-row">
            <span>Tema do sistema</span>
            <strong>Automatico</strong>
          </div>
          <div class="preference-row">
            <span>Pontuacao da pesquisa</span>
            <strong>{{ riskScoreLabel }}</strong>
          </div>
          <div class="preference-row">
            <span>Alertas de oportunidade</span>
            <strong>Preparado</strong>
          </div>
          <div class="preference-row">
            <span>Canal futuro</span>
            <strong>WhatsApp</strong>
          </div>
          <a class="preference-link" routerLink="/calculators" aria-label="Refazer pesquisa de perfil de risco">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">edit_note</span>
            Refazer pesquisa de risco
          </a>
        </article>

        <article class="profile-card shortcut-card">
          <div class="shortcut-icon material-symbols-rounded notranslate" aria-hidden="true">smart_toy</div>
          <h2>Carteira inteligente</h2>
          <p>Use a IA para revisar sua carteira e encontrar oportunidades de melhoria.</p>
          <a routerLink="/ai-analysis">Abrir inteligencia IA</a>
        </article>
      </section>
    </div>
  `,
  styles: [`
    .profile-page {
      min-height: 100%;
      padding: 28px;
      color: #0f172a;
    }

    .profile-hero {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: 18px;
      padding: 24px;
      border: 1px solid rgba(16, 185, 129, 0.16);
      border-radius: 28px;
      background:
        radial-gradient(circle at 12% 0%, rgba(16, 185, 129, 0.2), transparent 36%),
        linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(239, 253, 246, 0.86));
      box-shadow: 0 22px 60px rgba(15, 23, 42, 0.1);
    }

    .profile-avatar {
      width: 86px;
      height: 86px;
      display: grid;
      place-items: center;
      border-radius: 26px;
      color: #fff;
      font-size: 28px;
      font-weight: 800;
      background: linear-gradient(145deg, #22c55e, #0f8b59);
      box-shadow: 0 18px 38px rgba(16, 185, 129, 0.28);
    }

    .eyebrow {
      display: block;
      margin-bottom: 8px;
      color: #07814d;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    h1, h2, p {
      margin: 0;
    }

    h1 {
      font-size: 34px;
      line-height: 1;
    }

    .profile-title p,
    .card-heading p,
    .shortcut-card p {
      margin-top: 8px;
      color: #53617a;
      font-size: 14px;
    }

    .hero-action,
    .shortcut-card a,
    .secondary-action {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 0;
      border-radius: 16px;
      color: #fff;
      font-weight: 800;
      text-decoration: none;
      cursor: pointer;
      background: linear-gradient(145deg, #16a467, #08794e);
      box-shadow: 0 16px 36px rgba(16, 185, 129, 0.22);
    }

    .hero-action {
      padding: 0 18px;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 1.25fr 0.85fr;
      gap: 18px;
      margin-top: 18px;
    }

    .profile-card {
      padding: 22px;
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.86);
      box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
    }

    .card-heading {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 18px;
    }

    .card-heading > .material-symbols-rounded,
    .shortcut-icon {
      width: 46px;
      height: 46px;
      display: grid;
      place-items: center;
      border-radius: 16px;
      color: #0f8b59;
      background: rgba(16, 185, 129, 0.12);
    }

    .card-heading h2,
    .shortcut-card h2 {
      font-size: 20px;
    }

    .info-list {
      display: grid;
      gap: 12px;
      margin: 0;
    }

    .info-list div,
    .preference-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 14px 0;
      border-bottom: 1px solid rgba(148, 163, 184, 0.16);
    }

    .risk-summary {
      display: grid;
      grid-template-columns: 50px minmax(0, 1fr);
      gap: 12px;
      margin-bottom: 12px;
      padding: 16px;
      border: 1px solid rgba(16, 185, 129, 0.18);
      border-radius: 20px;
      background:
        radial-gradient(circle at 100% 0%, rgba(16, 185, 129, 0.18), transparent 36%),
        rgba(236, 253, 245, 0.72);
    }

    .risk-summary > .material-symbols-rounded {
      width: 50px;
      height: 50px;
      display: grid;
      place-items: center;
      border-radius: 17px;
      color: #fff;
      background: linear-gradient(145deg, #16a467, #08794e);
    }

    .risk-summary small {
      color: #047647;
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
    }

    .risk-summary strong {
      display: block;
      margin-top: 4px;
      color: #0f172a;
      font-size: 22px;
    }

    .risk-summary p {
      margin-top: 6px;
      color: #53617a;
      font-size: 13px;
      line-height: 1.45;
    }

    .preference-link {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      margin-top: 14px;
      border-radius: 15px;
      color: #fff;
      font-weight: 900;
      text-decoration: none;
      background: linear-gradient(135deg, #6729ff, #3187ff 48%, #27e29b);
      box-shadow: 0 16px 34px rgba(16, 185, 129, 0.18);
    }

    .info-list div:last-child,
    .preference-row:last-child {
      border-bottom: 0;
    }

    dt,
    .preference-row span {
      color: #64748b;
      font-size: 13px;
      font-weight: 700;
    }

    dd,
    .preference-row strong {
      margin: 0;
      color: #0f172a;
      font-size: 14px;
      font-weight: 800;
      text-align: right;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border-radius: 999px;
      color: #047647;
      font-size: 13px;
      font-weight: 800;
      background: rgba(16, 185, 129, 0.12);
    }

    .dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 0 5px rgba(34, 197, 94, 0.14);
    }

    .secondary-action {
      width: 100%;
      margin-top: 20px;
      background: linear-gradient(145deg, #334155, #0f172a);
      box-shadow: none;
    }

    .shortcut-card {
      display: grid;
      align-content: start;
      gap: 12px;
      border-color: rgba(124, 58, 237, 0.18);
      background:
        radial-gradient(circle at 15% 0%, rgba(124, 58, 237, 0.14), transparent 40%),
        rgba(255, 255, 255, 0.9);
    }

    .shortcut-card a {
      margin-top: 8px;
      background: linear-gradient(145deg, #7c3aed, #16a467);
    }

    @media (prefers-color-scheme: dark) {
      .profile-page {
        color: #f8fafc;
      }

      .profile-hero,
      .profile-card {
        border-color: rgba(124, 58, 237, 0.24);
        background:
          radial-gradient(circle at 18% 0%, rgba(124, 58, 237, 0.24), transparent 40%),
          rgba(13, 15, 40, 0.88);
      }

      .profile-title p,
      .card-heading p,
      .shortcut-card p,
      dt,
      .preference-row span {
        color: #b8c1dd;
      }

      dd,
      .preference-row strong,
      .risk-summary strong {
        color: #f8fafc;
      }

      .risk-summary {
        border-color: rgba(124, 58, 237, 0.26);
        background:
          radial-gradient(circle at 100% 0%, rgba(124, 58, 237, 0.22), transparent 36%),
          rgba(10, 14, 38, 0.76);
      }

      .risk-summary p {
        color: #b8c1dd;
      }
    }

    @media (max-width: 860px) {
      .profile-page {
        padding: 18px;
      }

      .profile-hero,
      .profile-grid {
        grid-template-columns: 1fr;
      }

      .hero-action {
        width: 100%;
      }
    }
  `]
})
export class ProfileComponent {
  private readonly auth = inject(AuthService);
  private readonly riskStorageKey = 'smartwallet-risk-profile';
  protected readonly user = this.auth.user;
  protected riskProfile = 'Nao definido';
  protected riskDescription = 'Responda a pesquisa nas calculadoras para personalizar alertas e recomendacoes.';
  protected riskScoreLabel = '-';

  constructor() {
    this.loadRiskProfile();
    window.addEventListener('storage', () => this.loadRiskProfile());
  }

  protected get initials(): string {
    const name = this.user()?.fullName?.trim();
    if (!name) {
      return 'PE';
    }

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }

  protected logout(): void {
    this.auth.logout();
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
}
