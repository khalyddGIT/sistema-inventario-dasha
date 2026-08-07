import { Component, OnInit } from '@angular/core';
import { ReporteService, ProductoMasVendido } from '../../services/reporte.service';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-reportes',
  template: `
    <div class="reportes-page">
      <div class="page-header">
        <div class="header-content">
          <div>
            <h1 class="page-title">
              <i class="pi pi-chart-pie"></i> Reportes
            </h1>
            <p class="page-subtitle">Panel de estadísticas y reportes del sistema</p>
          </div>
        </div>
      </div>

      <div class="container">
        <!-- Estadísticas generales de todos los reportes -->
        <div class="stats-grid p-mb-4">
          <div class="stat-card gradient-purple">
            <div class="stat-header">
              <i class="pi pi-shopping-bag p-text-2xl"></i>
              <h3 style="margin: 0;">Productos</h3>
            </div>
            <p class="p-text-2xl p-text-bold">{{ totalProductos }}</p>
          </div>

          <div class="stat-card gradient-orange">
            <div class="stat-header">
              <i class="pi pi-exclamation-triangle p-text-2xl"></i>
              <h3 style="margin: 0;">Stock Bajo</h3>
            </div>
            <p class="p-text-2xl p-text-bold">{{ stockBajoCount }}</p>
          </div>

          <div class="stat-card gradient-blue">
            <div class="stat-header">
              <i class="pi pi-clock p-text-2xl"></i>
              <h3 style="margin: 0;">Por Vencer</h3>
            </div>
            <p class="p-text-2xl p-text-bold">{{ porVencerCount }}</p>
          </div>

          <div class="stat-card gradient-red">
            <div class="stat-header">
              <i class="pi pi-times-circle p-text-2xl"></i>
              <h3 style="margin: 0;">Vencidos</h3>
            </div>
            <p class="p-text-2xl p-text-bold">{{ vencidosCount }}</p>
          </div>
        </div>

        <!-- Selector de reporte específico -->
        <div class="report-selector p-mb-3">
          <div class="p-grid p-ai-center">
            <div class="p-col-12 md:p-col-4">
              <label class="p-d-block p-mb-1">Tipo de Reporte</label>
              <p-dropdown
                [options]="tiposReporte"
                [(ngModel)]="reporteSeleccionado"
                optionLabel="nombre"
                optionValue="valor"
                [style]="{'width': '100%'}"
                placeholder="Seleccione un reporte"
                (onChange)="generarReporte()">
              </p-dropdown>
            </div>
            <div class="p-col-12 md:p-col-4" *ngIf="mostrarFechas()">
              <label class="p-d-block p-mb-1">Fecha Inicio</label>
              <p-calendar
                [(ngModel)]="fechaInicio"
                [showIcon]="true"
                dateFormat="dd/mm/yy">
              </p-calendar>
            </div>
            <div class="p-col-12 md:p-col-4" *ngIf="mostrarFechas()">
              <label class="p-d-block p-mb-1">Fecha Fin</label>
              <p-calendar
                [(ngModel)]="fechaFin"
                [showIcon]="true"
                dateFormat="dd/mm/yy">
              </p-calendar>
            </div>
          </div>
          <div class="p-mt-2 p-text-right">
            <p-button
              label="Generar Reporte"
              icon="pi pi-search"
              (onClick)="generarReporte()"
              [loading]="loading"
              styleClass="p-button-success">
            </p-button>
          </div>
        </div>

        <!-- Contenido del reporte específico -->
        <div *ngIf="!loading && reporteSeleccionado === 'productos_mas_vendidos' && productosMasVendidos.length > 0" class="report-content">
          <h2 class="report-title">
            <i class="pi pi-chart-pie"></i> Productos Más Vendidos
          </h2>

          <!-- Estadísticas generales -->
          <div class="stats-grid p-mb-3">
            <div class="stat-card gradient-purple">
              <div class="stat-header">
                <i class="pi pi-shopping-bag p-text-2xl"></i>
                <h3 style="margin: 0;">Total Productos</h3>
              </div>
              <p class="p-text-2xl p-text-bold">{{ productosMasVendidos.length }}</p>
            </div>

            <div class="stat-card gradient-green">
              <div class="stat-header">
                <i class="pi pi-money-bill p-text-2xl"></i>
                <h3 style="margin: 0;">Ingreso Total</h3>
              </div>
              <p class="p-text-2xl p-text-bold">S/. {{ ingresoTotal | number:'1.2-2' }}</p>
            </div>

            <div class="stat-card gradient-blue">
              <div class="stat-header">
                <i class="pi pi-bar-chart p-text-2xl"></i>
                <h3 style="margin: 0;">Unidades Vendidas</h3>
              </div>
              <p class="p-text-2xl p-text-bold">{{ unidadesVendidas }}</p>
            </div>
          </div>

          <!-- Tabla de productos más vendidos -->
          <div class="p-mb-3">
            <p-table
              [value]="productosMasVendidos"
              [paginator]="true"
              [rows]="10"
              [globalFilterFields]="['nombre','codigo']"
              styleClass="p-datatable-striped">
              <ng-template pTemplate="header">
                <tr>
                  <th style="width: 50px;">#</th>
                  <th>Producto</th>
                  <th>Código</th>
                  <th class="p-text-right">Cantidad</th>
                  <th class="p-text-right">Monto (S/.)</th>
                  <th class="p-text-right">%</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-producto let-i="rowIndex">
                <tr>
                  <td>{{ i + 1 }}</td>
                  <td><strong>{{ producto.nombre }}</strong></td>
                  <td>{{ producto.codigo }}</td>
                  <td class="p-text-right">{{ producto.cantidadVendida }}</td>
                  <td class="p-text-right">{{ producto.montoTotal | number:'1.2-2' }}</td>
                  <td class="p-text-right">{{ calcularPorcentaje(producto.montoTotal) | number:'1.2-2' }}%</td>
                </tr>
              </ng-template>
            </p-table>
          </div>

          <!-- Gráfico de barras -->
          <div class="chart-container p-mt-3">
            <h3 class="p-text-lg">Distribución de Ventas por Producto</h3>
            <canvas id="productosMasVendidosChart" height="150"></canvas>
          </div>
        </div>

        <!-- Reporte de Stock Bajo -->
        <div *ngIf="!loading && reporteSeleccionado === 'stock_bajo' && productosStockBajo.length > 0" class="report-content">
          <h2 class="report-title">
            <i class="pi pi-exclamation-triangle"></i> Productos con Stock Bajo
          </h2>
          <p-table
            [value]="productosStockBajo"
            [paginator]="true"
            [rows]="10"
            [globalFilterFields]="['nombre','codigo']"
            styleClass="p-datatable-striped">
            <ng-template pTemplate="header">
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th>Estado</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-producto>
              <tr>
                <td><strong>{{ producto.nombre }}</strong></td>
                <td>{{ producto.codigo }}</td>
                <td>{{ producto.stockActual }}</td>
                <td>{{ producto.stockMinimo }}</td>
                <td>
                  <span class="p-tag p-tag-warning" *ngIf="producto.stockActual > 0">Stock Bajo</span>
                  <span class="p-tag p-tag-danger" *ngIf="producto.stockActual === 0">Sin Stock</span>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>

        <!-- Reporte de Productos por Vencer -->
        <div *ngIf="!loading && reporteSeleccionado === 'productos_por_vencer' && productosPorVencer.length > 0" class="report-content">
          <h2 class="report-title">
            <i class="pi pi-clock"></i> Productos por Vencer
          </h2>
          <p-table
            [value]="productosPorVencer"
            [paginator]="true"
            [rows]="10"
            [globalFilterFields]="['nombre','codigo']"
            styleClass="p-datatable-striped">
            <ng-template pTemplate="header">
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th>Lote</th>
                <th>Vencimiento</th>
                <th>Días Restantes</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-producto>
              <tr>
                <td><strong>{{ producto.nombre }}</strong></td>
                <td>{{ producto.codigo }}</td>
                <td>{{ producto.lote }}</td>
                <td>{{ producto.fechaVencimiento | date:'dd/MM/yyyy' }}</td>
                <td>
                  <span class="p-tag p-tag-warning" *ngIf="calcularDiasRestantes(producto.fechaVencimiento) > 0">
                    {{ calcularDiasRestantes(producto.fechaVencimiento) }} días
                  </span>
                  <span class="p-tag p-tag-danger" *ngIf="calcularDiasRestantes(producto.fechaVencimiento) <= 0">
                    Vencido
                  </span>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>

        <!-- Reporte de Productos Vencidos -->
        <div *ngIf="!loading && reporteSeleccionado === 'productos_vencidos' && productosVencidos.length > 0" class="report-content">
          <h2 class="report-title">
            <i class="pi pi-exclamation-circle"></i> Productos Vencidos
          </h2>
          <p-table
            [value]="productosVencidos"
            [paginator]="true"
            [rows]="10"
            [globalFilterFields]="['nombre','codigo']"
            styleClass="p-datatable-striped">
            <ng-template pTemplate="header">
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th>Lote</th>
                <th>Vencimiento</th>
                <th>Días Vencido</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-producto>
              <tr>
                <td><strong>{{ producto.nombre }}</strong></td>
                <td>{{ producto.codigo }}</td>
                <td>{{ producto.lote }}</td>
                <td>{{ producto.fechaVencimiento | date:'dd/MM/yyyy' }}</td>
                <td>
                  <span class="p-tag p-tag-danger">
                    {{ calcularDiasVencido(producto.fechaVencimiento) }} días
                  </span>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>

        <!-- Mensajes -->
        <div *ngIf="!loading && reporteSeleccionado && productosMasVendidos.length === 0 &&
                    reporteSeleccionado === 'productos_mas_vendidos'" class="empty-state">
          <i class="pi pi-search p-text-4xl p-d-block p-text-center" style="color: #9e9e9e;"></i>
          <h3>No hay datos para mostrar</h3>
          <p>Intenta con otro rango de fechas o tipo de reporte</p>
        </div>

        <div *ngIf="!loading && reporteSeleccionado && productosStockBajo.length === 0 &&
                    reporteSeleccionado === 'stock_bajo'" class="empty-state">
          <i class="pi pi-check-circle p-text-4xl p-d-block p-text-center" style="color: #4caf50;"></i>
          <h3>No hay productos con stock bajo</h3>
          <p>¡El inventario está en buen estado!</p>
        </div>

        <div *ngIf="!loading && reporteSeleccionado && productosPorVencer.length === 0 &&
                    reporteSeleccionado === 'productos_por_vencer'" class="empty-state">
          <i class="pi pi-check-circle p-text-4xl p-d-block p-text-center" style="color: #4caf50;"></i>
          <h3>No hay productos por vencer</h3>
          <p>¡El inventario está actualizado!</p>
        </div>

        <div *ngIf="!loading && reporteSeleccionado && productosVencidos.length === 0 &&
                    reporteSeleccionado === 'productos_vencidos'" class="empty-state">
          <i class="pi pi-check-circle p-text-4xl p-d-block p-text-center" style="color: #4caf50;"></i>
          <h3>No hay productos vencidos</h3>
          <p>¡El inventario está actualizado!</p>
        </div>

        <div *ngIf="loading" class="p-d-flex p-ai-center p-jc-center p-mt-5">
          <p-progressSpinner [style]="{ width: '50px', height: '50px' }"></p-progressSpinner>
          <span class="p-ml-2">Generando reporte...</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reportes-page {
      padding: 2rem;
      background-color: #f8fafc;
      min-height: 100vh;
    }

    .page-header {
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      color: #1e293b;
      font-size: 1.8rem;
      font-weight: 700;
    }

    .page-subtitle {
      margin: 0.5rem 0 0 0;
      color: #64748b;
      font-size: 1rem;
    }

    .container {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    .report-selector {
      background: #f8fafc;
      padding: 1.5rem;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
    }

    .report-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #1e293b;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 1rem;
      margin: 0 0 1.5rem 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      text-align: center;
    }

    .stat-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #64748b;
    }

    .empty-state i {
      margin-bottom: 1rem;
    }

    .chart-container {
      background: #f8fafc;
      padding: 1.5rem;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
    }

    /* Responsive improvements */
    @media (max-width: 1024px) {
      .reportes-page {
        padding: 1.5rem;
      }

      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 0.75rem;
      }

      .p-grid.p-ai-center > .p-col-12.md\:p-col-4 {
        flex: 0 0 100%;
        max-width: 100%;
      }

      .p-grid.p-ai-center > .p-col-12.md\:p-col-4:nth-child(2),
      .p-grid.p-ai-center > .p-col-12.md\:p-col-4:nth-child(3) {
        margin-top: 1rem;
      }
    }

    @media (max-width: 768px) {
      .reportes-page {
        padding: 1rem;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
      }

      .page-title {
        font-size: 1.5rem;
      }

      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 0.5rem;
      }

      .stat-card {
        padding: 0.75rem !important;
      }

      .stat-header {
        flex-direction: column;
        gap: 0.25rem;
      }

      .p-text-2xl {
        font-size: 1.5rem !important;
      }

      .container {
        padding: 1rem;
      }

      .report-selector {
        padding: 1rem;
      }

      .p-grid.p-ai-center {
        flex-direction: column;
        align-items: stretch;
      }

      .p-grid.p-ai-center > .p-col-12.md\:p-col-4 {
        margin-top: 1rem;
      }

      .p-grid.p-ai-center > .p-col-12 {
        margin-bottom: 1rem;
      }

      .p-mt-2.p-text-right {
        text-align: center;
      }

      .p-mt-2.p-text-right > .p-button {
        width: 100%;
      }

      .report-title {
        font-size: 1.2rem;
      }

      .chart-container {
        padding: 1rem;
      }

      .p-datatable ::ng-deep .p-datatable-wrapper {
        overflow-x: auto;
      }

      .p-datatable ::ng-deep .p-datatable-table {
        min-width: 600px;
      }

      /* Ajustes específicos para tablas */
      .p-datatable ::ng-deep .p-datatable-thead > tr > th,
      .p-datatable ::ng-deep .p-datatable-tbody > tr > td {
        padding: 0.5rem;
        font-size: 0.85rem;
      }
    }

    @media (max-width: 480px) {
      .reportes-page {
        padding: 0.75rem;
      }

      .page-title {
        font-size: 1.3rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .stat-card {
        padding: 0.5rem !important;
      }

      .p-text-2xl {
        font-size: 1.2rem !important;
      }

      .container {
        padding: 0.75rem;
      }

      .report-selector {
        padding: 0.75rem;
      }

      .report-title {
        font-size: 1.1rem;
      }

      .chart-container {
        padding: 0.75rem;
      }

      .p-datatable ::ng-deep .p-datatable-table {
        min-width: 500px;
      }
    }
  `]
})
export class ReportesComponent implements OnInit {
  tiposReporte = [
    { nombre: 'Stock Bajo', valor: 'stock_bajo' },
    { nombre: 'Productos por Vencer', valor: 'productos_por_vencer' },
    { nombre: 'Productos Vencidos', valor: 'productos_vencidos' }
  ];

  reporteSeleccionado: string = 'stock_bajo';
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  loading = false;

  // Datos para el reporte de productos más vendidos
  productosMasVendidos: ProductoMasVendido[] = [];
  ingresoTotal: number = 0;
  unidadesVendidas: number = 0;

  // Datos para estadísticas generales
  totalProductos: number = 0;
  stockBajoCount: number = 0;
  porVencerCount: number = 0;
  vencidosCount: number = 0;

  // Datos para otros reportes
  productosStockBajo: any[] = [];
  productosPorVencer: any[] = [];
  productosVencidos: any[] = [];

  constructor(
    private reporteService: ReporteService,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    // Cargar todas las estadísticas generales y el reporte predeterminado
    this.cargarEstadisticasGenerales();
    this.generarReporte();
  }

  cargarEstadisticasGenerales(): void {
    // Cargar conteo de productos totales
    this.reporteService.getTotalProductos().subscribe({
      next: (total) => {
        this.totalProductos = total;
      },
      error: (error) => {
        console.error('Error al obtener total de productos:', error);
        // Si el endpoint no existe, usar servicio del producto para obtener conteo
        this.fallbackCargarTotalProductos();
      }
    });

    // Cargar conteo de productos con stock bajo
    this.reporteService.getStockBajoCount().subscribe({
      next: (count) => {
        this.stockBajoCount = count;
      },
      error: (error) => {
        console.error('Error al obtener conteo de stock bajo:', error);
        // Si el endpoint no existe, usar servicio del producto
        this.fallbackCargarStockBajo();
      }
    });

    // Cargar conteo de productos por vencer
    this.reporteService.getPorVencerCount().subscribe({
      next: (count) => {
        this.porVencerCount = count;
      },
      error: (error) => {
        console.error('Error al obtener conteo de productos por vencer:', error);
        // Si el endpoint no existe, usar servicio del producto
        this.fallbackCargarPorVencer();
      }
    });

    // Cargar conteo de productos vencidos
    this.reporteService.getVencidosCount().subscribe({
      next: (count) => {
        this.vencidosCount = count;
      },
      error: (error) => {
        console.error('Error al obtener conteo de productos vencidos:', error);
        // Si el endpoint no existe, usar servicio del producto
        this.fallbackCargarVencidos();
      }
    });
  }

  // Métodos alternativos si los endpoints de reportes no están disponibles
  fallbackCargarTotalProductos(): void {
    // Usar el servicio de productos para obtener el total
    this.productoService.getAllProductos().subscribe({
      next: (productos) => {
        this.totalProductos = productos.length;
      },
      error: (error) => {
        console.error('Error al obtener productos para conteo total:', error);
      }
    });
  }

  fallbackCargarStockBajo(): void {
    // Usar el servicio de productos para obtener productos con stock bajo
    this.productoService.getProductosStockBajo().subscribe({
      next: (productos) => {
        this.stockBajoCount = productos.length;
      },
      error: (error) => {
        console.error('Error al obtener productos con stock bajo:', error);
      }
    });
  }

  fallbackCargarPorVencer(): void {
    // Usar el servicio de productos para obtener productos por vencer
    this.productoService.getProductosPorVencer().subscribe({
      next: (productos) => {
        this.porVencerCount = productos.length;
      },
      error: (error) => {
        console.error('Error al obtener productos por vencer:', error);
      }
    });
  }

  fallbackCargarVencidos(): void {
    // Usar el servicio de productos para obtener productos vencidos
    this.productoService.getProductosVencidos().subscribe({
      next: (productos) => {
        this.vencidosCount = productos.length;
      },
      error: (error) => {
        console.error('Error al obtener productos vencidos:', error);
      }
    });
  }

  mostrarFechas(): boolean {
    return this.reporteSeleccionado === 'productos_mas_vendidos';
  }

  generarReporte(): void {
    this.loading = true;

    switch (this.reporteSeleccionado) {
      case 'productos_mas_vendidos':
        this.generarProductosMasVendidos();
        break;
      case 'stock_bajo':
        this.generarStockBajo();
        break;
      case 'productos_por_vencer':
        this.generarProductosPorVencer();
        break;
      case 'productos_vencidos':
        this.generarProductosVencidos();
        break;
    }
  }

  generarProductosMasVendidos(): void {
    this.productosMasVendidos = [];
    this.loading = false;
  }

  generarStockBajo(): void {
    this.reporteService.getStockBajo().subscribe({
      next: (productos) => {
        this.productosStockBajo = productos;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al obtener productos con stock bajo:', error);
        this.loading = false;
        this.productosStockBajo = [];
        if (error.status === 404) {
          console.warn('Endpoint de productos con stock bajo no encontrado, usando datos locales...');
        }
      }
    });
  }

  generarProductosPorVencer(): void {
    this.reporteService.getProductosPorVencer().subscribe({
      next: (productos) => {
        this.productosPorVencer = productos;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al obtener productos por vencer:', error);
        this.loading = false;
        this.productosPorVencer = [];
        if (error.status === 404) {
          console.warn('Endpoint de productos por vencer no encontrado, usando datos locales...');
        }
      }
    });
  }

  generarProductosVencidos(): void {
    this.reporteService.getProductosVencidos().subscribe({
      next: (productos) => {
        this.productosVencidos = productos;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al obtener productos vencidos:', error);
        this.loading = false;
        this.productosVencidos = [];
        if (error.status === 404) {
          console.warn('Endpoint de productos vencidos no encontrado, usando datos locales...');
        }
      }
    });
  }

  calcularEstadisticas(): void {
    this.ingresoTotal = this.productosMasVendidos.reduce((sum, prod) => sum + prod.montoTotal, 0);
    this.unidadesVendidas = this.productosMasVendidos.reduce((sum, prod) => sum + prod.cantidadVendida, 0);
  }

  calcularPorcentaje(monto: number): number {
    if (this.ingresoTotal === 0) return 0;
    return (monto / this.ingresoTotal) * 100;
  }

  calcularDiasRestantes(fechaVencimiento: string): number {
    const vencimiento = new Date(fechaVencimiento);
    const hoy = new Date();
    const diffTime = vencimiento.getTime() - hoy.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  calcularDiasVencido(fechaVencimiento: string): number {
    const vencimiento = new Date(fechaVencimiento);
    const hoy = new Date();
    const diffTime = hoy.getTime() - vencimiento.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  dibujarGrafico(): void {
    // Verificar si hay datos para dibujar
    if (this.productosMasVendidos.length === 0) return;

    // Implementación de Chart.js para el gráfico de productos más vendidos
    const canvas = document.getElementById('productosMasVendidosChart') as HTMLCanvasElement;
    if (!canvas) return;

    // Eliminar gráfico anterior si existe
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Destruir instancia anterior si existe
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    // Preparar datos para el gráfico (máximo 5 productos para evitar congestión)
    const topProductos = this.productosMasVendidos.slice(0, 5);
    const labels = topProductos.map(p => p.nombre);
    const data = topProductos.map(p => p.cantidadVendida);

    // Crear nuevo gráfico con Chart.js
    import('chart.js/auto').then(Chart => {
      this.chartInstance = new Chart.default(canvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Cantidad Vendida',
            data: data,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Cantidad'
              }
            }
          }
        }
      });
    }).catch(error => {
      console.error('Error al cargar Chart.js:', error);
      // Si hay error, mostrar mensaje en consola
      console.warn('Chart.js no se pudo cargar. Asegúrese de tenerlo instalado correctamente.');
    });
  }

  private chartInstance: any;
}