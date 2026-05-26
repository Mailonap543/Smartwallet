import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="landing-shell">
      <div class="circuit-layer" aria-hidden="true"></div>
      <div class="particle-field" aria-hidden="true"></div>

      <header class="topbar">
        <div class="brand" aria-label="Smartwallet">
          <span class="brand-mark" aria-hidden="true">W</span>
          <span>Smart<strong>wallet</strong></span>
        </div>

        <nav class="nav-links" aria-label="Navegação principal">
          <a href="#recursos">Recursos</a>
          <a href="#planos">Planos</a>
          <a href="#seguranca">Segurança</a>
          <a href="#sobre">Sobre</a>
          <a href="#blog">Blog</a>
          <a href="#ajuda">Ajuda</a>
        </nav>

        <div class="nav-actions">
          <button class="theme-toggle" type="button" aria-label="Alternar tema">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">dark_mode</span>
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">expand_more</span>
          </button>
          <a class="nav-button ghost" routerLink="/login">Entrar</a>
          <a class="nav-button primary" routerLink="/register">Criar conta</a>
        </div>
      </header>

      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">auto_awesome</span>
            Investimentos inteligentes
          </span>

          <h1>Seu futuro <span>começa aqui.</span></h1>
          <p>A plataforma completa para você investir com inteligência, segurança e autonomia.</p>

          <div class="feature-row" id="recursos">
            <article>
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">trending_up</span>
              <strong>Análises avançadas</strong>
              <small>Dados e insights em tempo real</small>
            </article>
            <article id="seguranca">
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">shield</span>
              <strong>Segurança máxima</strong>
              <small>Seus dados e investimentos protegidos</small>
            </article>
            <article>
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">bolt</span>
              <strong>Decisões inteligentes</strong>
              <small>IA e tecnologia trabalhando por você</small>
            </article>
          </div>

          <div class="hero-actions">
            <a class="cta primary" routerLink="/register">
              Criar conta gratuita
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">arrow_forward</span>
            </a>
            <a class="cta secondary" routerLink="/login">
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">play_arrow</span>
              Ver como funciona
            </a>
          </div>

          <div class="trust-line">
            <span><i class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">check</i>Grátis para começar</span>
            <span><i class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">lock</i>Sem cartão de crédito</span>
            <span><i class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">groups</i>+25 mil investidores confiam</span>
          </div>
        </div>

        <div class="hero-visual" aria-hidden="true">
          <article class="floating-card card-yield">
            <small>Rentabilidade</small>
            <strong>+12,65%</strong>
            <span>Acima do CDI</span>
            <svg viewBox="0 0 150 54" role="img">
              <path d="M5 44 L24 37 L38 40 L52 31 L66 34 L81 25 L96 29 L111 18 L127 22 L145 8" />
            </svg>
          </article>

          <article class="floating-card card-profile">
            <span class="donut"></span>
            <div>
              <small>Carteira Recomendada</small>
              <strong>Perfil Moderado</strong>
              <span>Risco balanceado</span>
            </div>
          </article>

          <article class="floating-card card-goal">
            <small>Meta de Patrimônio</small>
            <strong>R$ 250.000,00</strong>
            <span>67% concluído</span>
            <i></i>
          </article>

          <article class="floating-card card-security">
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">verified_user</span>
            <div>
              <small>Proteção Total</small>
              <strong>Seus dados 100%</strong>
              <span>criptografados</span>
            </div>
          </article>

          <div class="phone-stage">
            <div class="phone">
              <div class="phone-top">
                <span>9:41</span>
                <span></span>
              </div>
              <div class="phone-content">
                <h2>Olá, Ana!</h2>
                <p>Patrimônio total</p>
                <strong>R$ 125.430,80</strong>
                <div class="gain">+7,52% <small>nos últimos 30 dias</small></div>
                <svg class="phone-chart" viewBox="0 0 320 150">
                  <defs>
                    <linearGradient id="homeChartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#18df98" stop-opacity="0.55" />
                      <stop offset="100%" stop-color="#18df98" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                  <path class="chart-fill" d="M0 122 L24 100 L42 112 L62 86 L82 98 L104 70 L124 86 L146 56 L166 76 L188 48 L208 64 L230 38 L252 54 L276 30 L300 42 L320 14 L320 150 L0 150 Z" />
                  <path class="chart-line" d="M0 122 L24 100 L42 112 L62 86 L82 98 L104 70 L124 86 L146 56 L166 76 L188 48 L208 64 L230 38 L252 54 L276 30 L300 42 L320 14" />
                </svg>
                <div class="periods"><span>1D</span><span>1S</span><b>1M</b><span>3M</span><span>1A</span><span>TODOS</span></div>
                <p>Distribuição da carteira</p>
                <div class="distribution">
                  <span class="pie"></span>
                  <ul>
                    <li><i></i>Renda Fixa <b>40%</b></li>
                    <li><i></i>Ações <b>30%</b></li>
                    <li><i></i>Fundos <b>20%</b></li>
                    <li><i></i>Internacional <b>10%</b></li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="platform"></div>
          </div>
        </div>
      </section>

      <div class="tech-label">Tecnologia que transforma investidores</div>

      <section class="metrics-panel" id="sobre">
        <article>
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">groups</span>
          <strong>+25 mil</strong>
          <small>Usuarios ativos</small>
          <p>Investidores que confiam na nossa plataforma</p>
        </article>
        <article>
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">sync</span>
          <strong>R$ 2,8 bilhões</strong>
          <small>Em investimentos</small>
          <p>Volume total gerenciado com segurança</p>
        </article>
        <article>
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">monitoring</span>
          <strong>98,7%</strong>
          <small>Satisfação</small>
          <p>Clientes satisfeitos com nossa plataforma</p>
        </article>
        <article>
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">lock</span>
          <strong>100%</strong>
          <small>Seguro</small>
          <p>Criptografia de ponta e conformidade LGPD</p>
        </article>
        <article class="rating">
          <strong>Avaliação dos usuários</strong>
          <div class="stars">★ ★ ★ ★ ◐ <span>4.9 de 5</span></div>
          <p>Baseado em mais de 1.200 avaliações</p>
        </article>
      </section>

      <section class="partners" id="blog" aria-label="Confiança">
        <p>Confiam em nós</p>
        <div>
          <span>Google Cloud</span>
          <span>aws</span>
          <span>Microsoft Azure</span>
          <span>Let's Encrypt</span>
          <span>Cloudflare</span>
          <span>Trustpilot</span>
        </div>
      </section>

      <span id="planos" class="anchor"></span>
      <span id="ajuda" class="anchor"></span>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      color: #ffffff;
      background: #02030d;
    }

    .landing-shell {
      position: relative;
      min-height: 100vh;
      overflow: hidden;
      padding: 28px 54px 30px;
      background:
        repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 88px),
        repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 88px),
        linear-gradient(135deg, #02030d 0%, #050716 48%, #02030d 100%);
    }

    .landing-shell::before {
      position: absolute;
      inset: 86px 0 auto 47%;
      height: 72%;
      content: '';
      background:
        linear-gradient(110deg, transparent 0 22%, rgba(100, 65, 255, 0.16) 22.2% 22.5%, transparent 22.8%),
        linear-gradient(42deg, transparent 0 60%, rgba(0, 218, 255, 0.12) 60.2% 60.45%, transparent 60.8%),
        repeating-radial-gradient(ellipse at 58% 55%, rgba(23, 226, 185, 0.22) 0 1px, transparent 2px 34px);
      pointer-events: none;
      transform: skewY(-8deg);
      opacity: 0.82;
    }

    .circuit-layer,
    .particle-field {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .circuit-layer {
      opacity: 0.72;
      background:
        linear-gradient(90deg, transparent 0 56%, rgba(45, 216, 240, 0.13) 56.2% 56.35%, transparent 56.5%),
        linear-gradient(124deg, transparent 0 62%, rgba(111, 44, 255, 0.18) 62.1% 62.35%, transparent 62.6%);
    }

    .particle-field {
      background-image:
        radial-gradient(circle, rgba(24, 223, 152, 0.95) 0 1px, transparent 1.5px),
        radial-gradient(circle, rgba(111, 44, 255, 0.95) 0 1px, transparent 1.5px),
        radial-gradient(circle, rgba(45, 216, 240, 0.9) 0 1px, transparent 1.4px);
      background-position: 42% 26%, 68% 17%, 90% 62%;
      background-size: 280px 260px, 330px 300px, 260px 330px;
      animation: particleDrift 18s linear infinite;
      opacity: 0.86;
    }

    .topbar {
      position: relative;
      z-index: 3;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: 32px;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      color: #ffffff;
      font-size: 27px;
      font-weight: 900;
      line-height: 1;
    }

    .brand strong,
    .hero h1 span,
    .eyebrow {
      color: #18df98;
    }

    .brand-mark {
      width: 58px;
      height: 42px;
      display: grid;
      place-items: center;
      color: transparent;
      background: linear-gradient(135deg, #6f2cff 0%, #6b49ff 34%, #27d7f0 62%, #18df98 100%);
      -webkit-background-clip: text;
      background-clip: text;
      font-family: "Arial Black", Inter, system-ui, sans-serif;
      font-size: 56px;
      font-weight: 900;
      line-height: 0.82;
      letter-spacing: 0;
      filter: drop-shadow(0 0 18px rgba(111, 44, 255, 0.55)) drop-shadow(0 0 22px rgba(24, 223, 152, 0.25));
      transform: skewX(-7deg);
      animation: logoPulse 4s ease-in-out infinite;
    }

    .nav-links {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      gap: 36px;
    }

    .nav-links a,
    .nav-button,
    .cta {
      color: #ffffff;
      text-decoration: none;
    }

    .nav-links a {
      color: #e7ebff;
      font-size: 15px;
      font-weight: 600;
      transition: color 160ms ease, transform 160ms ease;
    }

    .nav-links a:hover {
      color: #18df98;
      transform: translateY(-1px);
    }

    .nav-actions {
      display: inline-flex;
      align-items: center;
      gap: 14px;
    }

    .theme-toggle,
    .nav-button {
      min-height: 42px;
      border: 1px solid rgba(64, 87, 146, 0.42);
      border-radius: 10px;
      background: rgba(7, 10, 30, 0.58);
      color: #ffffff;
      font: inherit;
    }

    .theme-toggle {
      width: 72px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      gap: 4px;
    }

    .nav-button {
      min-width: 138px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      font-weight: 700;
    }

    .nav-button.primary,
    .cta.primary {
      border-color: transparent;
      background: linear-gradient(100deg, #6f2cff 0%, #365cff 48%, #16d99b 100%);
      box-shadow: 0 18px 38px rgba(111, 44, 255, 0.34), 0 0 28px rgba(24, 223, 152, 0.18);
    }

    .hero {
      position: relative;
      z-index: 2;
      min-height: 720px;
      display: grid;
      grid-template-columns: minmax(440px, 610px) minmax(520px, 1fr);
      gap: 54px;
      align-items: center;
      padding-top: 36px;
    }

    .hero-copy {
      display: grid;
      align-content: center;
      gap: 28px;
    }

    .eyebrow {
      width: max-content;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 9px 15px;
      border: 1px solid rgba(47, 216, 240, 0.2);
      border-radius: 999px;
      background: rgba(36, 22, 91, 0.55);
      font-size: 14px;
      font-weight: 800;
      text-transform: uppercase;
    }

    .eyebrow .material-symbols-rounded {
      font-size: 17px;
      color: #8a5cff;
    }

    h1,
    h2,
    p {
      margin: 0;
    }

    .hero h1 {
      max-width: 540px;
      font-size: 68px;
      line-height: 1.04;
      font-weight: 950;
    }

    .hero h1 span {
      display: block;
      background: linear-gradient(100deg, #6f2cff 0%, #2d93ff 38%, #18df98 80%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    .hero-copy > p {
      max-width: 540px;
      color: #c6ccdf;
      font-size: 19px;
      line-height: 1.55;
    }

    .feature-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 28px;
      margin-top: 14px;
    }

    .feature-row article {
      display: grid;
      grid-template-columns: 54px minmax(0, 1fr);
      gap: 12px;
      align-items: center;
    }

    .feature-row .material-symbols-rounded {
      grid-row: span 2;
      width: 54px;
      height: 54px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #18df98;
      background: rgba(111, 44, 255, 0.22);
      box-shadow: inset 0 0 22px rgba(45, 216, 240, 0.06);
    }

    .feature-row strong {
      font-size: 14px;
    }

    .feature-row small,
    .trust-line,
    .floating-card span,
    .phone p,
    .phone small,
    .metrics-panel p,
    .metrics-panel small {
      color: #b6bdd3;
    }

    .feature-row small {
      font-size: 13px;
      line-height: 1.45;
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 28px;
      margin-top: 28px;
    }

    .cta {
      min-width: 286px;
      min-height: 66px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      border-radius: 8px;
      font-size: 17px;
      font-weight: 800;
      transition: transform 160ms ease, filter 160ms ease;
    }

    .cta.secondary {
      border: 1px solid rgba(140, 77, 255, 0.62);
      background: rgba(7, 10, 30, 0.62);
    }

    .cta.secondary .material-symbols-rounded {
      color: #8b5cff;
      font-size: 30px;
    }

    .cta:hover,
    .nav-button:hover,
    .theme-toggle:hover {
      transform: translateY(-2px);
      filter: brightness(1.08);
    }

    .trust-line {
      display: flex;
      flex-wrap: wrap;
      gap: 34px;
      font-size: 14px;
    }

    .trust-line span {
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }

    .trust-line i {
      color: #18df98;
      font-size: 19px;
      font-style: normal;
    }

    .hero-visual {
      position: relative;
      min-height: 650px;
    }

    .phone-stage {
      position: absolute;
      inset: 14px 70px auto auto;
      width: 375px;
      height: 630px;
      animation: phoneIn 900ms cubic-bezier(.2, .85, .2, 1) both 120ms;
    }

    .phone {
      position: relative;
      z-index: 2;
      width: 335px;
      min-height: 596px;
      margin: 0 auto;
      padding: 25px 22px 22px;
      border: 3px solid #27324b;
      border-radius: 42px;
      background: linear-gradient(160deg, #081024 0%, #030612 70%);
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1), 0 36px 80px rgba(0,0,0,0.48);
      transform: rotate(7deg);
    }

    .phone::before {
      position: absolute;
      left: 50%;
      top: 12px;
      width: 118px;
      height: 22px;
      border-radius: 0 0 18px 18px;
      content: '';
      transform: translateX(-50%);
      background: #02030d;
    }

    .phone-top {
      display: flex;
      justify-content: space-between;
      color: #ffffff;
      font-size: 13px;
      font-weight: 800;
    }

    .phone-top span:last-child {
      width: 48px;
      height: 10px;
      border-radius: 999px;
      background: linear-gradient(90deg, #ffffff 0 26%, transparent 26% 38%, #ffffff 38% 62%, transparent 62% 74%, #ffffff 74%);
    }

    .phone-content {
      display: grid;
      gap: 13px;
      padding-top: 36px;
      color: #ffffff;
    }

    .phone h2 {
      font-size: 17px;
      font-style: italic;
    }

    .phone-content > strong {
      font-size: 27px;
    }

    .gain {
      width: max-content;
      display: inline-flex;
      align-items: center;
      gap: 9px;
      padding: 6px 9px;
      border-radius: 7px;
      color: #ffffff;
      background: rgba(24, 223, 152, 0.7);
      font-size: 12px;
      font-weight: 900;
      animation: gainPulse 2.5s ease-in-out infinite;
    }

    .phone-chart {
      width: 100%;
      height: 150px;
      margin-top: 6px;
      overflow: visible;
    }

    .chart-fill {
      fill: url(#homeChartFill);
    }

    .chart-line {
      fill: none;
      stroke: #18df98;
      stroke-width: 4;
      stroke-linecap: round;
      stroke-linejoin: round;
      filter: drop-shadow(0 0 12px rgba(24, 223, 152, 0.5));
      animation: chartFloat 3.2s ease-in-out infinite;
    }

    .periods {
      display: flex;
      justify-content: space-between;
      color: #828ba5;
      font-size: 12px;
    }

    .periods b {
      padding: 6px 11px;
      border-radius: 999px;
      color: #ffffff;
      background: rgba(45, 216, 240, 0.22);
    }

    .distribution {
      display: grid;
      grid-template-columns: 112px minmax(0, 1fr);
      gap: 18px;
      align-items: center;
    }

    .pie {
      width: 112px;
      height: 112px;
      border-radius: 50%;
      background: conic-gradient(#18df98 0 40%, #6f2cff 40% 70%, #1e70ff 70% 90%, #ffb020 90% 100%);
      mask: radial-gradient(circle, transparent 0 38%, #000 39%);
    }

    .distribution ul {
      display: grid;
      gap: 9px;
      margin: 0;
      padding: 0;
      list-style: none;
      color: #d8dcf1;
      font-size: 12px;
    }

    .distribution li {
      display: grid;
      grid-template-columns: 12px minmax(0, 1fr) auto;
      align-items: center;
      gap: 8px;
    }

    .distribution li i {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #18df98;
    }

    .distribution li:nth-child(2) i { background: #6f2cff; }
    .distribution li:nth-child(3) i { background: #1e70ff; }
    .distribution li:nth-child(4) i { background: #ffb020; }

    .platform {
      position: absolute;
      left: 50%;
      bottom: -44px;
      width: 510px;
      height: 122px;
      border: 1px solid rgba(24, 223, 152, 0.58);
      border-radius: 50%;
      transform: translateX(-50%) perspective(520px) rotateX(66deg);
      background:
        radial-gradient(circle, rgba(255,255,255,0.95) 0 2%, rgba(111,44,255,0.72) 3% 11%, transparent 12%),
        repeating-radial-gradient(circle, rgba(45,216,240,0.52) 0 2px, transparent 2px 31px);
      box-shadow: 0 0 58px rgba(45, 216, 240, 0.28), 0 0 82px rgba(111, 44, 255, 0.3);
    }

    .floating-card {
      position: absolute;
      z-index: 4;
      display: grid;
      gap: 8px;
      padding: 22px;
      border: 1px solid rgba(111, 44, 255, 0.48);
      border-radius: 11px;
      background: linear-gradient(145deg, rgba(13, 17, 44, 0.82), rgba(6, 11, 32, 0.64));
      box-shadow: 0 24px 70px rgba(0,0,0,0.26), inset 0 0 24px rgba(45,216,240,0.04);
      backdrop-filter: blur(18px);
      animation: cardFloat 5.5s ease-in-out infinite;
    }

    .floating-card small {
      color: #ffffff;
      font-size: 12px;
      font-weight: 800;
    }

    .floating-card strong {
      font-size: 20px;
    }

    .floating-card svg {
      width: 145px;
      height: 52px;
    }

    .floating-card path {
      fill: none;
      stroke: #18df98;
      stroke-width: 3;
    }

    .card-yield {
      top: 110px;
      left: 18px;
      width: 188px;
      transform: rotate(-5deg);
    }

    .card-profile {
      top: 306px;
      left: 0;
      width: 222px;
      grid-template-columns: 56px minmax(0, 1fr);
      align-items: center;
      animation-delay: 500ms;
    }

    .donut {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: conic-gradient(#18df98 0 28%, #6f2cff 28% 68%, #2dd8f0 68% 100%);
      mask: radial-gradient(circle, transparent 0 52%, #000 53%);
    }

    .card-goal {
      top: 190px;
      right: 0;
      width: 210px;
      animation-delay: 800ms;
    }

    .card-goal i {
      width: 100%;
      height: 8px;
      border-radius: 999px;
      background: linear-gradient(90deg, #6f2cff 0 67%, rgba(35, 50, 85, 0.9) 67%);
      box-shadow: 0 0 16px rgba(24, 223, 152, 0.34);
    }

    .card-security {
      right: 32px;
      bottom: 125px;
      width: 210px;
      grid-template-columns: 56px minmax(0, 1fr);
      align-items: center;
      animation-delay: 1100ms;
    }

    .card-security .material-symbols-rounded {
      width: 54px;
      height: 54px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #18df98;
      background: rgba(0, 168, 255, 0.18);
      font-size: 34px;
    }

    .tech-label {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 18px;
      margin-top: 8px;
      color: #c9d4ec;
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
    }

    .tech-label::before,
    .tech-label::after {
      width: 32%;
      height: 1px;
      content: '';
      background: linear-gradient(90deg, transparent, #2dd8f0);
    }

    .tech-label::after {
      background: linear-gradient(90deg, #2dd8f0, transparent);
    }

    .metrics-panel {
      position: relative;
      z-index: 2;
      display: grid;
      grid-template-columns: 1.05fr 1.1fr 1fr 1fr 1.25fr;
      gap: 0;
      margin-top: 16px;
      padding: 25px 28px;
      border: 1px solid rgba(47, 216, 240, 0.16);
      border-radius: 12px;
      background: linear-gradient(145deg, rgba(8, 13, 36, 0.86), rgba(5, 8, 28, 0.74));
      box-shadow: inset 0 0 34px rgba(45,216,240,0.03), 0 26px 70px rgba(0,0,0,0.24);
    }

    .metrics-panel article {
      display: grid;
      grid-template-columns: 58px minmax(0, 1fr);
      gap: 8px 18px;
      align-items: start;
      padding: 0 26px;
      border-right: 1px solid rgba(184, 194, 220, 0.13);
    }

    .metrics-panel article:first-child {
      padding-left: 0;
    }

    .metrics-panel article:last-child {
      border-right: 0;
      padding-right: 0;
    }

    .metrics-panel .material-symbols-rounded {
      grid-row: span 3;
      width: 58px;
      height: 58px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #18df98;
      background: rgba(111, 44, 255, 0.18);
      font-size: 32px;
    }

    .metrics-panel strong {
      font-size: 24px;
      line-height: 1.08;
    }

    .metrics-panel small {
      font-size: 15px;
      font-weight: 700;
    }

    .metrics-panel p {
      grid-column: 2;
      font-size: 13px;
      line-height: 1.55;
    }

    .rating {
      grid-template-columns: 1fr;
    }

    .stars {
      margin-top: 6px;
      color: #18df98;
      font-size: 28px;
      white-space: nowrap;
    }

    .stars span {
      color: #ffffff;
      font-size: 17px;
      font-weight: 800;
    }

    .rating p {
      grid-column: auto;
    }

    .partners {
      position: relative;
      z-index: 2;
      display: grid;
      gap: 20px;
      justify-items: center;
      margin-top: 18px;
      color: #7f8aa5;
    }

    .partners p {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
    }

    .partners div {
      width: min(100%, 1040px);
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 24px;
      align-items: center;
      text-align: center;
      color: #8f9ab6;
      font-size: 20px;
      font-weight: 800;
    }

    .anchor {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
    }

    @keyframes particleDrift {
      to { background-position: 42% 118%, 68% 115%, 90% 130%; }
    }

    @keyframes logoPulse {
      0%, 100% {
        transform: skewX(-7deg) translateY(0) scale(1);
        filter: drop-shadow(0 0 18px rgba(111, 44, 255, 0.55)) drop-shadow(0 0 22px rgba(24, 223, 152, 0.25));
      }

      50% {
        transform: skewX(-7deg) translateY(-2px) scale(1.04);
        filter: drop-shadow(0 0 26px rgba(111, 44, 255, 0.74)) drop-shadow(0 0 28px rgba(24, 223, 152, 0.38));
      }
    }

    @keyframes phoneIn {
      from { opacity: 0; transform: translateX(70px) scale(0.96); }
      to { opacity: 1; transform: translateX(0) scale(1); }
    }

    @keyframes chartFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    @keyframes gainPulse {
      0%, 100% { box-shadow: 0 0 0 rgba(24, 223, 152, 0); }
      50% { box-shadow: 0 0 24px rgba(24, 223, 152, 0.36); }
    }

    @keyframes cardFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    .card-yield {
      animation-name: yieldFloat;
    }

    @keyframes yieldFloat {
      0%, 100% { transform: rotate(-5deg) translateY(0); }
      50% { transform: rotate(-5deg) translateY(-8px); }
    }

    @media (max-width: 1180px) {
      .landing-shell {
        padding: 22px 22px 34px;
        overflow-y: auto;
      }

      .topbar {
        grid-template-columns: 1fr auto;
      }

      .nav-links {
        display: none;
      }

      .hero {
        grid-template-columns: 1fr;
      }

      .hero-visual {
        min-height: 690px;
      }

      .metrics-panel {
        grid-template-columns: repeat(2, 1fr);
        gap: 22px;
      }

      .metrics-panel article {
        border-right: 0;
        padding: 0;
      }

      .partners div {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 760px) {
      .topbar {
        grid-template-columns: 1fr;
      }

      .nav-actions {
        width: 100%;
        justify-content: stretch;
      }

      .theme-toggle {
        display: none;
      }

      .nav-button {
        min-width: 0;
        flex: 1;
      }

      .hero h1 {
        font-size: 46px;
      }

      .hero-copy > p {
        font-size: 17px;
      }

      .feature-row,
      .metrics-panel,
      .partners div {
        grid-template-columns: 1fr;
      }

      .cta {
        width: 100%;
        min-width: 0;
      }

      .hero-visual {
        min-height: 610px;
      }

      .phone-stage {
        inset: 0 auto auto 50%;
        width: 320px;
        transform: translateX(-50%);
        animation: none;
      }

      .phone {
        width: 284px;
        min-height: 545px;
      }

      .floating-card {
        display: none;
      }

      .metrics-panel {
        padding: 22px;
      }
    }
  `]
})
export class HomepageComponent {}
