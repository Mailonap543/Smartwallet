import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './services/auth.service';
import { ApiService, NotificationItem } from './services/api.service';
import { ToastContainerComponent } from './shared/components/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);

  protected showNavigation = !this.isPublicRoute(this.router.url);
  protected isJarvisRoute = this.isJarvisUrl(this.router.url);
  protected readonly user = this.auth.user;
  protected notificationsOpen = false;
  protected notifications: NotificationItem[] = [];
  protected unreadNotifications = 0;
  protected whatsappPhone = '';
  protected whatsappBuyAlerts = true;
  protected whatsappAiBridge = true;
  protected notificationPreferencesSaved = false;

  protected readonly navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard', exact: true },
    { label: 'Ativos', path: '/market', icon: 'monitoring', exact: true },
    { label: 'Inteligencia IA', path: '/ai-analysis', icon: 'smart_toy', exact: false },
    { label: 'Objetivos', path: '/calculators', icon: 'target', exact: false },
    { label: 'Relatorios', path: '/favorites', icon: 'description', exact: false },
    { label: 'Calendario', path: '/market/dividends', icon: 'calendar_month', exact: false },
    { label: 'Carteira', path: '/wallet', icon: 'account_balance_wallet', exact: false },
    { label: 'Bancos', path: '/banks', icon: 'account_balance', exact: false },
    { label: 'Assinaturas', path: '/subscription', icon: 'workspace_premium', exact: false },
    { label: 'Perfil', path: '/profile', icon: 'person', exact: true },
    { label: 'Configuracoes', path: '/settings', icon: 'settings', exact: false }
  ];

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => {
        this.showNavigation = !this.isPublicRoute(event.urlAfterRedirects);
        this.isJarvisRoute = this.isJarvisUrl(event.urlAfterRedirects);
        if (this.showNavigation) {
          this.loadNotifications();
        }
      });

    if (this.showNavigation) {
      this.loadNotifications();
    }
    this.loadWhatsappPreferences();
  }

  private isPublicRoute(url: string): boolean {
    const cleanUrl = url.split('?')[0].split('#')[0];
    return cleanUrl === '/' || cleanUrl === '' || ['/login', '/register', '/home'].some(route => cleanUrl.startsWith(route));
  }

  private isJarvisUrl(url: string): boolean {
    return !this.isPublicRoute(url);
  }

  private isJarvisUrl(url: string): boolean {
    return !this.isPublicRoute(url);
  }

  protected logout(): void {
    sessionStorage.clear();
    this.auth.logout();
  }

  protected toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
    if (this.notificationsOpen) {
      this.loadNotifications();
    }
  }

  protected markNotificationAsRead(notification: NotificationItem): void {
    if (notification.isRead) {
      return;
    }

    this.api.markNotificationAsRead(notification.id).subscribe({
      next: () => {
        notification.isRead = true;
        this.unreadNotifications = Math.max(0, this.unreadNotifications - 1);
      }
    });
  }

  protected markAllNotificationsAsRead(): void {
    this.api.markAllNotificationsAsRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map(notification => ({ ...notification, isRead: true }));
        this.unreadNotifications = 0;
      }
    });
  }

  protected saveWhatsappPreferences(): void {
    localStorage.setItem('smartwallet-whatsapp-alerts', JSON.stringify({
      phone: this.whatsappPhone,
      buyAlerts: this.whatsappBuyAlerts,
      aiBridge: this.whatsappAiBridge,
      updatedAt: new Date().toISOString()
    }));
    this.notificationPreferencesSaved = true;
  }

  private loadNotifications(): void {
    if (!this.auth.getToken()) {
      this.notifications = [];
      this.unreadNotifications = 0;
      return;
    }

    this.api.getNotifications().subscribe({
      next: notifications => {
        this.notifications = notifications;
        this.unreadNotifications = notifications.filter(notification => !notification.isRead).length;
      }
    });
  }

  private loadWhatsappPreferences(): void {
    const savedPreferences = localStorage.getItem('smartwallet-whatsapp-alerts');
    if (!savedPreferences) {
      return;
    }

    try {
      const parsed = JSON.parse(savedPreferences) as { phone?: string; buyAlerts?: boolean; aiBridge?: boolean };
      this.whatsappPhone = parsed.phone || '';
      this.whatsappBuyAlerts = parsed.buyAlerts ?? true;
      this.whatsappAiBridge = parsed.aiBridge ?? true;
    } catch {
      localStorage.removeItem('smartwallet-whatsapp-alerts');
    }
  }

  protected userInitials(): string {
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
}
