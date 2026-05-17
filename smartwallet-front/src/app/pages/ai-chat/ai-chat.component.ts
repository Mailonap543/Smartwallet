import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, JarvisChatResponse } from '../../services/api.service';

type ChatRole = 'user' | 'ai';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-900">
      <header class="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <h1 class="text-2xl font-bold text-white">SmartWallet • Jarvis</h1>
        </div>
      </header>

      <nav class="bg-gray-800/50 border-b border-gray-700 px-6">
        <div class="max-w-7xl mx-auto flex gap-6">
          <a routerLink="/dashboard" class="py-4 px-2 text-gray-400 hover:text-white transition-colors">Dashboard</a>
          <a routerLink="/assets" class="py-4 px-2 text-gray-400 hover:text-white transition-colors">Ativos</a>
          <a routerLink="/ai-analysis" class="py-4 px-2 text-gray-400 hover:text-white transition-colors">Análise IA</a>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto px-6 py-6">
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col min-h-[65vh]">
          <div class="flex items-center justify-between mb-3 text-sm">
            <div class="text-gray-300">Respostas por voz</div>
            <button
              type="button"
              (click)="toggleVoice()"
              class="px-3 py-1 rounded border transition-colors"
              [class]="voiceEnabled() ? 'bg-green-600/20 border-green-500 text-green-300' : 'bg-gray-700 border-gray-600 text-gray-300'"
            >
              {{ voiceEnabled() ? 'Ligado' : 'Desligado' }}
            </button>
          </div>

          <div class="flex-1 overflow-auto space-y-4 pr-2">
            @for (m of messages(); track $index) {
              <div class="flex" [class.justify-end]="m.role === 'user'" [class.justify-start]="m.role !== 'user'">
                <div class="max-w-[80%] rounded-lg px-4 py-3 whitespace-pre-wrap"
                     [class.bg-blue-600/20]="m.role === 'user'"
                     [class.border-blue-500/50]="m.role === 'user'"
                     [class.bg-gray-700/50]="m.role !== 'user'"
                     [class.border-gray-600]="m.role !== 'user'"
                     [class.border]="true">
                  <div class="text-xs opacity-70 mb-1">
                    {{ m.role === 'user' ? 'Você' : 'Jarvis' }}
                  </div>
                  <div class="text-sm text-gray-100">{{ m.content }}</div>
                  @if (m.role === 'ai') {
                    <button
                      type="button"
                      (click)="speak(m.content)"
                      class="mt-2 text-xs text-blue-300 hover:text-blue-200"
                    >
                      Ouvir resposta
                    </button>
                  }
                </div>
              </div>
            }

            @if (messages().length === 0) {
              <div class="text-gray-400 text-sm">
                Faça uma pergunta, por exemplo: “qual meu nível de risco?” ou “como posso reduzir risco?”.
              </div>
            }
          </div>

          <div class="pt-4 border-t border-gray-700 mt-4">
            <form class="flex gap-3" (ngSubmit)="send()">
              <input
                name="message"
                class="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                placeholder="Digite sua mensagem..."
                [(ngModel)]="messageText"
                required
              />

              <button
                type="submit"
                [disabled]="isSending()"
                class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (isSending()) {
                  <span class="inline-flex items-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Enviando...
                  </span>
                } @else {
                  Enviar
                }
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  `
})
export class AiChatComponent {
  private api = inject(ApiService);

  messages = signal<ChatMessage[]>([]);
  isSending = signal(false);
  voiceEnabled = signal(false);
  sessionId = signal<string | null>(null);

  messageText = '';

  send() {
    const text = this.messageText.trim();
    if (!text) return;

    this.messages.update((prev) => [...prev, { role: 'user', content: text }]);
    this.messageText = '';
    this.isSending.set(true);

    this.api.chatWithJarvis({ message: text, sessionId: this.sessionId() ?? undefined }).subscribe({
      next: (res: JarvisChatResponse) => {
        this.sessionId.set(res.sessionId);
        this.messages.update((prev) => [...prev, { role: 'ai', content: res.reply }]);
        if (this.voiceEnabled()) {
          this.speak(res.reply);
        }
        this.isSending.set(false);
      },
      error: () => {
        this.messages.update((prev) => [
          ...prev,
          { role: 'ai', content: 'Desculpe, ocorreu um erro ao gerar a resposta. Tente novamente.' }
        ]);
        this.isSending.set(false);
      }
    });
  }

  toggleVoice() {
    this.voiceEnabled.update((value) => !value);
  }

  speak(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find((v) => v.lang?.toLowerCase().startsWith('pt'));
    if (ptVoice) utterance.voice = ptVoice;

    window.speechSynthesis.speak(utterance);
  }
}

