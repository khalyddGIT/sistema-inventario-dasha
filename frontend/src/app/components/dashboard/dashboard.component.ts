import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { CompraService } from '../../services/compra.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Producto } from '../../models/producto';
import { Compra } from '../../models/compra';
import { Subject, takeUntil, finalize } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Datos
  allProductos: Producto[] = [];
  recentProducts: Producto[] = [];
  stockBajoProductos: Producto[] = [];
  vencimientoProductos: Producto[] = [];
  vencidosProductos: Producto[] = [];
  compras: Compra[] = [];

  totalProductos: number = 0;
  totalStock: number = 0;
  totalComprasCount: number = 0;
  montoTotalCompras: number = 0;

  // Filtro de fecha activo (Día, Semana, Mes, Año)
  selectedPeriod: string = 'Mes';
  currentDate: Date = new Date();
  showDatePicker = false;

  // Configuración del gráfico
  chartData: any;
  chartOptions: any;

  // Estado UI
  loading = true;
  error = false;
  errorMessage = '';
  hasAlerts = false;
  today = new Date();

  // Usuario actual
  currentUser$ = this.authService.currentUser$;

  private destroy$ = new Subject<void>();

  constructor(
    private productoService: ProductoService,
    private compraService: CompraService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initChartConfig();
    this.loadAllData();
    
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cdr.detectChanges();
      });
  }

  navigateDate(direction: number): void {
    const d = new Date(this.currentDate);
    if (this.selectedPeriod === 'Día') {
      d.setDate(d.getDate() + direction);
    } else if (this.selectedPeriod === 'Semana') {
      d.setDate(d.getDate() + (direction * 7));
    } else if (this.selectedPeriod === 'Mes') {
      d.setMonth(d.getMonth() + direction);
    } else if (this.selectedPeriod === 'Año') {
      d.setFullYear(d.getFullYear() + direction);
    }
    this.currentDate = d;
    this.updateChartForDate();
  }

  resetDateToToday(): void {
    this.currentDate = new Date();
    this.updateChartForDate();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initChartConfig(): void {
    this.chartData = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
      datasets: [
        {
          label: 'Nivel de Inventario (Unidades)',
          data: [620, 850, 740, 980, 1120, 1350, 1432],
          fill: true,
          borderColor: '#5551ff',
          borderWidth: 3,
          backgroundColor: 'rgba(85, 81, 255, 0.08)',
          tension: 0.4,
          pointBackgroundColor: '#5551ff',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 100,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#1e293b',
          titleFont: { size: 13, weight: 'bold' },
          bodyFont: { size: 12 },
          padding: 10,
          cornerRadius: 8,
          displayColors: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#64748b',
            font: { size: 10, weight: '500' },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 7
          }
        },
        y: {
          grid: {
            color: '#f1f5f9'
          },
          ticks: {
            color: '#64748b',
            font: { size: 10, weight: '500' },
            maxTicksLimit: 5
          }
        }
      }
    };
  }

  loadAllData(): void {
    this.loading = true;
    this.error = false;

    // Cargar productos
    this.productoService.getAllProductos().pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading = false)
    ).subscribe({
      next: (productos) => {
        this.allProductos = productos;
        this.totalProductos = productos.length;
        this.recentProducts = productos.slice(0, 7);
        this.totalStock = productos.reduce((sum, p) => sum + (p.stockActual || 0), 0);
        this.checkAlerts();
      },
      error: (err) => this.handleError('Error al cargar productos', err)
    });

    // Cargar stock bajo
    this.productoService.getProductosStockBajo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (productos) => {
          this.stockBajoProductos = productos;
          this.checkAlerts();
        },
        error: (err) => this.handleError('Error stock bajo', err)
      });

    // Cargar por vencer
    this.productoService.getProductosPorVencer()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (productos) => {
          this.vencimientoProductos = productos;
          this.checkAlerts();
        },
        error: (err) => this.handleError('Error por vencer', err)
      });

    // Cargar vencidos
    this.productoService.getProductosVencidos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (productos) => {
          this.vencidosProductos = productos;
          this.checkAlerts();
        },
        error: (err) => this.handleError('Error vencidos', err)
      });

    // Cargar historial de compras para resumen
    this.compraService.getAllCompras()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (compras) => {
          this.compras = compras;
          this.totalComprasCount = compras.length;
          this.montoTotalCompras = compras.reduce((sum, c) => sum + (c.total || 0), 0);
        },
        error: (err) => console.log('Compras no cargadas o vacías', err)
      });
  }

  setPeriod(period: string): void {
    this.selectedPeriod = period;
    this.updateChartForDate();
  }

  updateChartForDate(): void {
    let labels: string[] = [];
    let data: number[] = [];
    const baseStock = this.totalStock > 0 ? this.totalStock : 1430;

    if (this.selectedPeriod === 'Día') {
      labels = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
      data = [baseStock - 40, baseStock - 25, baseStock - 10, baseStock, baseStock - 15, baseStock - 30, baseStock];
    } else if (this.selectedPeriod === 'Semana') {
      labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      data = [baseStock - 180, baseStock - 140, baseStock - 90, baseStock - 40, baseStock + 60, baseStock + 120, baseStock];
    } else if (this.selectedPeriod === 'Mes') {
      labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
      data = [baseStock - 420, baseStock - 280, baseStock - 110, baseStock];
    } else {
      labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
      data = [620, 850, 740, 980, 1120, 1350, 1432, baseStock - 200, baseStock - 100, baseStock, baseStock + 100, baseStock + 200];
    }

    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Nivel de Inventario (Unidades)',
          data: data,
          fill: true,
          borderColor: '#5551ff',
          borderWidth: 3,
          backgroundColor: 'rgba(85, 81, 255, 0.08)',
          tension: 0.4,
          pointBackgroundColor: '#5551ff',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    };

    this.cdr.detectChanges();
  }

  private checkAlerts(): void {
    this.hasAlerts = 
      this.stockBajoProductos.length > 0 || 
      this.vencimientoProductos.length > 0 || 
      this.vencidosProductos.length > 0;

    this.cdr.detectChanges();
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.error = true;
    this.errorMessage = 'No se pudieron cargar los datos. Intenta recargar.';
    this.loading = false;
  }

  goTo(path: string): void {
    this.router.navigate([path]);
  }

  refreshData(): void {
    this.loadAllData();
  }

  getStatusClass(producto: Producto): string {
    if (producto.stockActual <= 0) return 'status-badge danger';
    if (producto.stockActual <= producto.stockMinimo) return 'status-badge warning';
    return 'status-badge success';
  }

  getStatusText(producto: Producto): string {
    if (producto.stockActual <= 0) return 'Sin Stock';
    if (producto.stockActual <= producto.stockMinimo) return 'Stock Bajo';
    return 'En Stock';
  }
}