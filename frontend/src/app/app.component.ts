import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ProductoService } from './services/producto.service';
import { Producto } from './models/producto';
import { Role } from './models/role';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface AppNotification {
  id: number;
  title: string;
  detail: string;
  icon: string;
  severity: 'warning' | 'danger' | 'info';
  time: string;
  read: boolean;
  link?: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'dasha-frontend';
  isLoggedIn = false;
  currentUser: any;
  showMenu = false;
  isScrolled = false;
  sidebarCollapsed = false;
  Role = Role;
  today = new Date();

  // Panel de Notificaciones
  notifications: AppNotification[] = [];
  showNotificationsPanel = false;
  unreadCount = 0;

  // Búsqueda en vivo del encabezado
  headerSearchTerm = '';
  searchResults: Producto[] = [];
  showSearchDropdown = false;
  allProducts: Producto[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private productoService: ProductoService,
    private router: Router
  ) {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isLoggedIn = !!user;
        this.currentUser = user;
        if (this.isLoggedIn) {
          this.loadNotificationsAndProducts();
        }
      });
  }

  ngOnInit(): void {
    this.setupScrollListener();
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.sidebarCollapsed = JSON.parse(savedState);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupScrollListener(): void {
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      this.isScrolled = scrollTop > 50;
    }, { passive: true });
  }

  private loadNotificationsAndProducts(): void {
    this.productoService.getAllProductos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (productos) => {
          this.allProducts = productos;
          this.buildNotifications(productos);
        },
        error: (err) => console.log('Carga de notificaciones', err)
      });
  }

  private buildNotifications(productos: Producto[]): void {
    const list: AppNotification[] = [];
    let idCounter = 1;

    productos.forEach(p => {
      if (p.stockActual <= 0) {
        list.push({
          id: idCounter++,
          title: 'Sin Stock',
          detail: `"${p.nombre}" se encuentra agotado (0 unidades).`,
          icon: 'pi-times-circle',
          severity: 'danger',
          time: 'Agotado',
          read: false,
          link: '/productos'
        });
      } else if (p.stockActual <= p.stockMinimo) {
        list.push({
          id: idCounter++,
          title: 'Stock Bajo Alerta',
          detail: `"${p.nombre}" tiene solo ${p.stockActual} unidades. (Mínimo: ${p.stockMinimo}).`,
          icon: 'pi-exclamation-triangle',
          severity: 'warning',
          time: 'Atención requerida',
          read: false,
          link: '/productos'
        });
      }

      if (p.fechaVencimiento) {
        const venc = new Date(p.fechaVencimiento);
        const diffDays = Math.floor((venc.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 30) {
          list.push({
            id: idCounter++,
            title: 'Por Vencer Próximamente',
            detail: `"${p.nombre}" (Lote: ${p.lote || 'N/A'}) vence en ${diffDays} días.`,
            icon: 'pi-clock',
            severity: 'warning',
            time: `${diffDays} días restantes`,
            read: false,
            link: '/productos'
          });
        } else if (diffDays < 0) {
          list.push({
            id: idCounter++,
            title: 'Producto Vencido',
            detail: `"${p.nombre}" venció el ${p.fechaVencimiento.split('T')[0]}.`,
            icon: 'pi-times-circle',
            severity: 'danger',
            time: 'Urgente',
            read: false,
            link: '/productos'
          });
        }
      }
    });

    this.notifications = list;
    this.unreadCount = list.filter(n => !n.read).length;
  }

  toggleNotifications(): void {
    this.showNotificationsPanel = !this.showNotificationsPanel;
    this.showSearchDropdown = false;
  }

  markAllNotificationsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.unreadCount = 0;
  }

  onNotificationClick(notif: AppNotification): void {
    notif.read = true;
    this.unreadCount = this.notifications.filter(n => !n.read).length;
    this.showNotificationsPanel = false;
    if (notif.link) {
      this.router.navigate([notif.link]);
    }
  }

  // Live Header Search
  onHeaderSearch(): void {
    const term = this.headerSearchTerm.trim().toLowerCase();
    if (!term) {
      this.searchResults = [];
      this.showSearchDropdown = false;
      return;
    }

    this.searchResults = this.allProducts.filter(p =>
      p.nombre?.toLowerCase().includes(term) ||
      p.codigo?.toLowerCase().includes(term) ||
      p.lote?.toLowerCase().includes(term) ||
      p.laboratorio?.nombre?.toLowerCase().includes(term) ||
      p.categoria?.nombre?.toLowerCase().includes(term)
    ).slice(0, 6);

    this.showSearchDropdown = true;
    this.showNotificationsPanel = false;
  }

  selectSearchResult(producto: Producto): void {
    this.headerSearchTerm = '';
    this.showSearchDropdown = false;
    this.router.navigate(['/productos']);
  }

  viewAllSearchResults(): void {
    this.showSearchDropdown = false;
    this.router.navigate(['/productos']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.header-search-pill') && !target.closest('.search-results-dropdown')) {
      this.showSearchDropdown = false;
    }
    if (!target.closest('.notification-btn') && !target.closest('.notifications-dropdown-panel')) {
      this.showNotificationsPanel = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  openOnHover = true;
  sidebarHoverExpanded = false;
  openSubMenu: { [key: string]: boolean } = {};

  onSidebarMouseEnter(): void {
    if (this.sidebarCollapsed && this.openOnHover) {
      this.sidebarHoverExpanded = true;
    }
  }

  onSidebarMouseLeave(): void {
    if (this.sidebarCollapsed) {
      this.sidebarHoverExpanded = false;
    }
  }

  toggleSubMenu(key: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.openSubMenu[key] = !this.openSubMenu[key];
  }

  toggleSidebarCollapse(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.sidebarHoverExpanded = false;
    localStorage.setItem('sidebarCollapsed', JSON.stringify(this.sidebarCollapsed));
  }

  hasRole(role: Role): boolean {
    return this.currentUser && this.currentUser.rol === role;
  }

  hasAnyRole(roles: Role[]): boolean {
    return this.currentUser && roles.includes(this.currentUser.rol);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.showMenu = false;
  }

  getNavbarClass(): string {
    return this.isScrolled ? 'navbar scrolled' : 'navbar';
  }
}