import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService, GoogleSearchResult, JarvisChatResponse } from '../../services/api.service';

type ChatRole = 'user' | 'ai';

interface ChatMessage {
  role: ChatRole;
  content: string;
  sources?: GoogleSearchResult[];
  googleUrl?: string;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="jarvis-chat">
      <header class="chat-header">
        <a routerLink="/ai-analysis" aria-label="Voltar para inteligencia IA">
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">arrow_back</span>
        </a>

        <div>
          <span>JARVIS VOICE LINK</span>
          <h1>Fale com a IA</h1>
          <p>Use texto, microfone e pesquisa Google para analisar acoes e oportunidades.</p>
        </div>

        <button
          type="button"
          class="voice-toggle"
          [class.active]="voiceEnabled()"
          (click)="toggleVoice()"
          aria-label="Alternar respostas por voz"
        >
          <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">record_voice_over</span>
          {{ voiceEnabled() ? 'Voz ativa' : 'Voz off' }}
        </button>
      </header>

      <main class="chat-grid">
        <section class="conversation-panel" aria-label="Conversa com Jarvis">
          <div class="conversation-stream">
            @if (!messages().length) {
              <div class="empty-state">
                <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">mic</span>
                <h2>Pronto para ouvir</h2>
                <p>Pergunte sobre PETR4, FIIs, dividendos, risco da carteira ou oportunidades de compra.</p>
              </div>
            }

            @for (message of messages(); track $index) {
              <article class="message" [class.user]="message.role === 'user'">
                <strong>{{ message.role === 'user' ? 'Voce' : 'Jarvis' }}</strong>
                <p>{{ message.content }}</p>

                @if (message.sources?.length) {
                  <div class="source-list">
                    @for (source of message.sources; track source.link) {
                      <a [href]="source.link" target="_blank" rel="noreferrer">
                        <span>{{ source.title }}</span>
                        <small>{{ source.displayLink || source.link }}</small>
                      </a>
                    }
                  </div>
                }

                @if (message.googleUrl) {
                  <a class="google-link" [href]="message.googleUrl" target="_blank" rel="noreferrer">
                    Abrir pesquisa no Google
                  </a>
                }

                @if (message.role === 'ai') {
                  <button type="button" class="listen-again" (click)="speak(message.content)">
                    <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">volume_up</span>
                    Ouvir
                  </button>
                }
              </article>
            }
          </div>

          <form class="command-bar" (ngSubmit)="send()">
              <button
                type="button"
                class="mic-control"
                [class.listening]="isListening()"
                (click)="toggleListening()"
                [attr.aria-label]="isListening() ? 'Parar microfone' : 'Ativar microfone'"
              >
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">
                {{ isListening() ? 'stop_circle' : 'mic' }}
              </span>
            </button>

            <input
              name="message"
              type="text"
              [(ngModel)]="messageText"
              placeholder="Pergunte ou fale com o Jarvis..."
              aria-label="Mensagem para o Jarvis"
              required
            />

            <button
              type="button"
              class="search-toggle"
              [class.active]="webSearchEnabled()"
              (click)="toggleWebSearch()"
              aria-label="Alternar pesquisa Google"
            >
              <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">travel_explore</span>
              Google
            </button>

            <button type="submit" class="send-button" [disabled]="isSending()">
              @if (isSending()) {
                <span class="material-symbols-rounded notranslate spin" translate="no" aria-hidden="true">progress_activity</span>
              } @else {
                <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">send</span>
              }
            </button>
          </form>

          @if (voiceStatus()) {
            <small class="support-note" [class.warning]="!recognitionSupported()">{{ voiceStatus() }}</small>
          }
        </section>

        <aside class="integration-panel" aria-label="Integracoes da IA">
          <article>
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">travel_explore</span>
            <div>
              <h2>Google Search</h2>
              <p>Quando ligado, a IA consulta a ponte do backend para buscar informacoes atuais sobre acoes.</p>
            </div>
          </article>

          <article>
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">settings_voice</span>
            <div>
              <h2>Microfone</h2>
              <p>Entrada por voz via navegador, pronta para comandos como "analise PETR4".</p>
            </div>
          </article>

          <article>
            <span class="material-symbols-rounded notranslate" translate="no" aria-hidden="true">hub</span>
            <div>
              <h2>Kotlin / Python</h2>
              <p>O endpoint de chat ja aceita pesquisa web e fica preparado para plugar sua IA externa.</p>
            </div>
          </article>
        </aside>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100%;
    }

    .jarvis-chat {
      min-height: 100%;
      padding: 16px;
      color: #f8fbff;
      background:
        linear-gradient(rgba(0, 198, 255, 0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 198, 255, 0.035) 1px, transparent 1px),
        radial-gradient(circle at 54% 4%, rgba(0, 153, 255, 0.22), transparent 30%),
        linear-gradient(145deg, #02040d 0%, #050b1c 48%, #02040d 100%);
      background-size: 34px 34px, 34px 34px, auto, auto;
    }

    h1, h2, p {
      margin: 0;
    }

    .chat-header {
      display: grid;
      grid-template-columns: 48px minmax(0, 1fr) auto;
      gap: 14px;
      align-items: center;
      min-height: 98px;
      margin-bottom: 14px;
      padding: 16px;
      border: 1px solid rgba(0, 195, 255, 0.2);
      border-radius: 4px 22px 4px 22px;
      background: rgba(3, 10, 28, 0.84);
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.36), inset 0 0 30px rgba(0, 149, 255, 0.05);
    }

    .chat-header a,
    .voice-toggle,
    .mic-control,
    .search-toggle,
    .send-button,
    .listen-again {
      border: 1px solid rgba(0, 195, 255, 0.22);
      color: #dbeafe;
      background: rgba(3, 10, 28, 0.76);
      cursor: pointer;
    }

    .chat-header a {
      width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      text-decoration: none;
    }

    .chat-header span {
      color: #22e6ff;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0.12em;
    }

    .chat-header h1 {
      margin-top: 4px;
      font-size: 30px;
    }

    .chat-header p,
    .integration-panel p,
    .empty-state p,
    .support-note {
      color: #b8c5e8;
      line-height: 1.45;
    }

    .voice-toggle {
      min-height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0 14px;
      border-radius: 4px 16px 4px 16px;
      font-weight: 900;
    }

    .voice-toggle.active,
    .search-toggle.active {
      border-color: rgba(39, 226, 155, 0.44);
      color: #27e29b;
      box-shadow: 0 0 22px rgba(39, 226, 155, 0.16);
    }

    .chat-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 320px;
      gap: 14px;
    }

    .conversation-panel,
    .integration-panel {
      border: 1px solid rgba(0, 195, 255, 0.2);
      border-radius: 6px 22px 6px 22px;
      background:
        linear-gradient(145deg, rgba(4, 12, 30, 0.88), rgba(2, 6, 18, 0.9)),
        radial-gradient(circle at 50% 0%, rgba(0, 195, 255, 0.14), transparent 36%);
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.34), inset 0 0 32px rgba(0, 149, 255, 0.05);
    }

    .conversation-panel {
      min-height: calc(100vh - 158px);
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto auto;
      padding: 14px;
    }

    .conversation-stream {
      min-height: 420px;
      overflow: auto;
      display: grid;
      align-content: start;
      gap: 12px;
      padding-right: 6px;
    }

    .empty-state {
      min-height: 360px;
      display: grid;
      place-items: center;
      align-content: center;
      gap: 12px;
      text-align: center;
    }

    .empty-state > .material-symbols-rounded {
      width: 96px;
      height: 96px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #dbeafe;
      font-size: 58px;
      background: radial-gradient(circle, rgba(124, 58, 237, 0.5), rgba(2, 10, 28, 0.9));
      box-shadow: 0 0 44px rgba(56, 189, 248, 0.4);
    }

    .message {
      width: min(760px, 88%);
      display: grid;
      gap: 8px;
      padding: 14px;
      border: 1px solid rgba(0, 195, 255, 0.18);
      border-radius: 4px 18px 4px 18px;
      background: rgba(6, 13, 35, 0.76);
    }

    .message.user {
      justify-self: end;
      border-color: rgba(39, 226, 155, 0.24);
      background: rgba(3, 36, 34, 0.72);
    }

    .message strong {
      color: #22e6ff;
      font-size: 12px;
      text-transform: uppercase;
    }

    .message p {
      color: #edf4ff;
      line-height: 1.5;
      white-space: pre-wrap;
    }

    .source-list {
      display: grid;
      gap: 8px;
      margin-top: 4px;
    }

    .source-list a,
    .google-link {
      display: grid;
      gap: 2px;
      padding: 10px;
      border: 1px solid rgba(56, 189, 248, 0.18);
      border-radius: 10px;
      color: #dbeafe;
      text-decoration: none;
      background: rgba(2, 8, 24, 0.7);
    }

    .source-list small,
    .google-link {
      color: #9fb0dc;
      font-size: 12px;
    }

    .listen-again {
      width: max-content;
      min-height: 34px;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      border-radius: 10px;
      padding: 0 10px;
    }

    .command-bar {
      display: grid;
      grid-template-columns: 54px minmax(0, 1fr) 116px 54px;
      gap: 10px;
      align-items: center;
      margin-top: 14px;
      padding: 10px;
      border: 1px solid rgba(0, 195, 255, 0.18);
      border-radius: 4px 18px 4px 18px;
      background: rgba(2, 8, 24, 0.78);
    }

    .command-bar input {
      width: 100%;
      min-height: 48px;
      border: 1px solid rgba(0, 195, 255, 0.18);
      border-radius: 12px;
      padding: 0 14px;
      color: #f8fbff;
      background: rgba(3, 10, 28, 0.84);
      outline: 0;
    }

    .command-bar input:focus {
      border-color: rgba(39, 226, 155, 0.46);
      box-shadow: 0 0 0 4px rgba(39, 226, 155, 0.08);
    }

    .mic-control,
    .send-button {
      width: 54px;
      height: 48px;
      display: grid;
      place-items: center;
      border-radius: 50%;
    }

    .mic-control.listening {
      color: #27e29b;
      border-color: rgba(39, 226, 155, 0.52);
      box-shadow: 0 0 32px rgba(39, 226, 155, 0.28);
    }

    .search-toggle {
      min-height: 48px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      border-radius: 12px;
      font-weight: 900;
    }

    .send-button {
      color: #fff;
      border-color: rgba(124, 58, 237, 0.45);
      background: linear-gradient(135deg, #3b22d5, #6729ff 52%, #1068ff);
    }

    .support-note {
      margin-top: 10px;
      font-size: 12px;
    }

    .support-note.warning {
      color: #fbbf24;
    }

    .integration-panel {
      display: grid;
      align-content: start;
      gap: 12px;
      padding: 14px;
    }

    .integration-panel article {
      display: grid;
      grid-template-columns: 48px minmax(0, 1fr);
      gap: 12px;
      padding: 12px;
      border: 1px solid rgba(0, 195, 255, 0.16);
      border-radius: 4px 16px 4px 16px;
      background: rgba(2, 8, 24, 0.68);
    }

    .integration-panel .material-symbols-rounded {
      width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #b8a8ff;
      background: radial-gradient(circle at 35% 25%, rgba(124, 58, 237, 0.84), rgba(23, 37, 84, 0.6));
      box-shadow: 0 0 22px rgba(124, 58, 237, 0.34);
    }

    .integration-panel h2 {
      font-size: 16px;
    }

    .integration-panel p {
      margin-top: 4px;
      font-size: 12px;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 980px) {
      .chat-grid {
        grid-template-columns: 1fr;
      }

      .chat-header {
        grid-template-columns: 44px minmax(0, 1fr);
      }

      .voice-toggle {
        grid-column: 1 / -1;
      }
    }

    @media (max-width: 640px) {
      .jarvis-chat {
        padding: 12px 12px 86px;
      }

      .command-bar {
        grid-template-columns: 48px minmax(0, 1fr) 48px;
      }

      .search-toggle {
        grid-column: 1 / -1;
      }

      .send-button,
      .mic-control {
        width: 48px;
      }
    }
  `]
})
export class AiChatComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private recognition: any | null = null;

  messages = signal<ChatMessage[]>([]);
  isSending = signal(false);
  voiceEnabled = signal(false);
  webSearchEnabled = signal(true);
  isListening = signal(false);
  recognitionSupported = signal(this.hasSpeechRecognition());
  voiceStatus = signal('');
  sessionId = signal<string | null>(null);

  messageText = '';

  ngOnInit(): void {
    this.recognitionSupported.set(this.hasSpeechRecognition());
    if (!this.recognitionSupported()) {
      this.voiceStatus.set('Reconhecimento de voz nao detectado. Use Chrome ou Edge em localhost/HTTPS, ou continue digitando.');
    }

    if (this.route.snapshot.queryParamMap.get('voice') === '1') {
      this.voiceStatus.set('Modo voz pronto. Clique no microfone abaixo e permita o acesso quando o navegador pedir.');
    }
  }

  send(): void {
    const text = this.messageText.trim();
    if (!text || this.isSending()) {
      return;
    }

    this.messages.update(previous => [...previous, { role: 'user', content: text }]);
    this.messageText = '';
    this.isSending.set(true);

    this.api.chatWithJarvis({
      message: text,
      sessionId: this.sessionId() ?? undefined,
      webSearch: this.webSearchEnabled()
    }).subscribe({
      next: response => this.handleJarvisResponse(response),
      error: () => {
        this.messages.update(previous => [
          ...previous,
          {
            role: 'ai',
            content: 'Nao consegui falar com o backend agora. Verifique se a API esta ligada e tente novamente.'
          }
        ]);
        this.isSending.set(false);
      }
    });
  }

  toggleVoice(): void {
    this.voiceEnabled.update(value => !value);
  }

  toggleWebSearch(): void {
    this.webSearchEnabled.update(value => !value);
  }

  toggleListening(): void {
    if (this.isListening()) {
      this.recognition?.stop();
      this.isListening.set(false);
      return;
    }

    const SpeechRecognition = this.getSpeechRecognitionConstructor();
    if (!SpeechRecognition) {
      this.recognitionSupported.set(false);
      this.requestRawMicrophoneCheck();
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'pt-BR';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;
    this.recognition.onresult = (event: any) => this.applyTranscript(event);
    this.recognition.onerror = (event: any) => {
      this.isListening.set(false);
      this.voiceStatus.set(this.getRecognitionErrorMessage(event?.error));
      this.messages.update(previous => [
        ...previous,
        { role: 'ai', content: this.voiceStatus() || 'Nao consegui acessar o microfone. Confirme a permissao do navegador.' }
      ]);
    };
    this.recognition.onend = () => {
      this.isListening.set(false);
      if (!this.messageText.trim()) {
        this.voiceStatus.set('Microfone pausado. Clique novamente e fale perto do computador.');
      }
    };

    try {
      this.recognition.start();
      this.isListening.set(true);
      this.voiceStatus.set('Ouvindo... fale sua pergunta sobre a carteira ou uma acao.');
    } catch {
      this.voiceStatus.set('O microfone ja estava iniciando. Aguarde um instante e tente de novo.');
    }
  }

  speak(text: string): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1;

    const voice = window.speechSynthesis.getVoices().find(item => item.lang?.toLowerCase().startsWith('pt'));
    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  }

  private handleJarvisResponse(response: JarvisChatResponse): void {
    this.sessionId.set(response.sessionId);
    this.messages.update(previous => [
      ...previous,
      {
        role: 'ai',
        content: response.reply,
        sources: response.searchResults || [],
        googleUrl: response.googleUrl
      }
    ]);

    if (this.voiceEnabled()) {
      this.speak(response.reply);
    }

    this.isSending.set(false);
  }

  private applyTranscript(event: any): void {
    const transcript = event?.results?.[0]?.[0]?.transcript?.trim();
    if (!transcript) {
      return;
    }

    this.messageText = `${this.messageText} ${transcript}`.trim();
    this.voiceStatus.set('Texto capturado. Revise e envie para o Jarvis.');
  }

  private hasSpeechRecognition(): boolean {
    return !!this.getSpeechRecognitionConstructor();
  }

  private getSpeechRecognitionConstructor(): any | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const browserWindow = window as any;
    return browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition || null;
  }

  private requestRawMicrophoneCheck(): void {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.voiceStatus.set('Este navegador nao oferece acesso ao microfone para a pagina. Tente Chrome ou Edge.');
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
        this.voiceStatus.set('Microfone permitido, mas o navegador nao tem reconhecimento de fala. Use Chrome ou Edge para transformar voz em texto.');
      })
      .catch(() => {
        this.voiceStatus.set('Microfone bloqueado. Libere a permissao do site no navegador e tente novamente.');
      });
  }

  private getRecognitionErrorMessage(errorCode: string | undefined): string {
    switch (errorCode) {
      case 'not-allowed':
      case 'service-not-allowed':
        return 'Microfone bloqueado. Clique no cadeado da barra do navegador e permita o microfone.';
      case 'no-speech':
        return 'Nao ouvi sua fala. Clique no microfone de novo e fale mais perto.';
      case 'audio-capture':
        return 'Nenhum microfone foi encontrado no computador.';
      case 'network':
        return 'O servico de reconhecimento de voz falhou por rede. Tente novamente.';
      default:
        return 'Nao consegui iniciar o reconhecimento de voz. Tente Chrome ou Edge em localhost/HTTPS.';
    }
  }
}
