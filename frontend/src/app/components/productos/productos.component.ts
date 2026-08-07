// src/app/components/productos/productos.component.ts

import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto';
import { Categoria } from '../../models/categoria';
import { Laboratorio } from '../../models/laboratorio';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit, OnDestroy {

  // ==================== DATOS ====================
  productos: Producto[] = [];
  filteredProductos: Producto[] = [];
  searchTerm = '';
  selectedStatusFilter: 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRING' = 'ALL';

  // Metrics
  totalProductosCount = 0;
  totalStockUnits = 0;
  lowStockCount = 0;
  expiringCount = 0;

  // ==================== ESTADO UI ====================
  loading = true;
  showForm = false;

  // ==================== FORMULARIO ====================
  editingProducto: Producto | null = null;
  productoForm: Producto = this.getEmptyProducto();

  // ==================== DESTRUCCIÓN ====================
  private destroy$ = new Subject<void>();

  constructor(
    private productoService: ProductoService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProductos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== CARGA ====================
  loadProductos(): void {
    this.loading = true;

    this.productoService.getAllProductos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (productos) => {
          this.productos = productos;
          this.calculateMetrics();
          this.filterProductos();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar productos', err);
          this.loading = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los productos' });
        }
      });
  }

  calculateMetrics(): void {
    this.totalProductosCount = this.productos.length;
    this.totalStockUnits = this.productos.reduce((sum, p) => sum + (p.stockActual || 0), 0);
    this.lowStockCount = this.productos.filter(p => p.stockActual > 0 && p.stockActual <= p.stockMinimo).length;
    this.expiringCount = this.productos.filter(p => this.isExpiringSoon(p) || this.isExpired(p)).length;
  }

  // ==================== FILTRO ====================
  filterProductos(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredProductos = this.productos.filter(p => {
      // Check search term
      const matchesSearch = !term || (
        p.nombre?.toLowerCase().includes(term) ||
        p.codigo?.toLowerCase().includes(term) ||
        p.laboratorio?.nombre?.toLowerCase().includes(term) ||
        p.categoria?.nombre?.toLowerCase().includes(term) ||
        p.lote?.toLowerCase().includes(term)
      );

      // Check status filter
      let matchesStatus = true;
      if (this.selectedStatusFilter === 'IN_STOCK') {
        matchesStatus = p.stockActual > p.stockMinimo;
      } else if (this.selectedStatusFilter === 'LOW_STOCK') {
        matchesStatus = p.stockActual > 0 && p.stockActual <= p.stockMinimo;
      } else if (this.selectedStatusFilter === 'OUT_OF_STOCK') {
        matchesStatus = p.stockActual <= 0;
      } else if (this.selectedStatusFilter === 'EXPIRING') {
        matchesStatus = this.isExpiringSoon(p) || this.isExpired(p);
      }

      return matchesSearch && matchesStatus;
    });
  }

  setStatusFilter(status: 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRING'): void {
    this.selectedStatusFilter = status;
    this.filterProductos();
  }

  // ==================== STOCK & VENCIMIENTO ====================
  getStockClass(producto: Producto): string {
    if (producto.stockActual <= 0) return 'danger';
    if (producto.stockActual <= producto.stockMinimo) return 'warning';
    return 'success';
  }

  getStockIcon(producto: Producto): string {
    if (producto.stockActual <= 0) return 'pi pi-times-circle';
    if (producto.stockActual <= producto.stockMinimo) return 'pi pi-exclamation-triangle';
    return 'pi pi-check-circle';
  }

  isExpiringSoon(producto: Producto): boolean {
    if (!producto.fechaVencimiento) return false;
    const vencimiento = new Date(producto.fechaVencimiento);
    const hoy = new Date();
    const diffDays = Math.floor(
      (vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays >= 0 && diffDays <= 30;
  }

  isExpired(producto: Producto): boolean {
    if (!producto.fechaVencimiento) return false;
    const vencimiento = new Date(producto.fechaVencimiento);
    const hoy = new Date();
    return vencimiento.getTime() < hoy.getTime();
  }

  // ==================== FORMULARIO ====================
  openCreateForm(): void {
    this.editingProducto = null;
    this.productoForm = this.getEmptyProducto();
    this.showForm = true;
  }

  openEditForm(producto: Producto): void {
    this.editingProducto = { ...producto };

    this.productoForm = {
      ...producto,
      fechaVencimiento: producto.fechaVencimiento
        ? producto.fechaVencimiento.split('T')[0]
        : ''
    };

    this.showForm = true;
  }

  duplicateProducto(producto: Producto): void {
    const duplicado: Producto = {
      ...producto,
      id: 0,
      codigo: '',
      lote: '',
      nombre: `${producto.nombre} (Copia)`,
      fechaVencimiento: ''
    };

    this.editingProducto = null;
    this.productoForm = duplicado;
    this.showForm = true;
  }

  private getEmptyProducto(): Producto {
    return {
      id: 0,
      codigo: '',
      nombre: '',
      presentacion: '',
      lote: '',
      fechaVencimiento: '',
      stockActual: 0,
      stockMinimo: 10,
      precioCompra: 0,
      precioVenta: 0,
      categoria: { id: 0, nombre: '' } as Categoria,
      laboratorio: { id: 0, nombre: '' } as Laboratorio
    };
  }

  // ==================== GUARDAR ====================
  saveProducto(): void {
    // Add loading state to prevent duplicate submissions
    if (this.loading) {
      return; // Already processing a request
    }

    if (!this.isFormValid()) {
      alert('Por favor completa correctamente todos los campos obligatorios');
      return;
    }

    this.loading = true; // Set loading state

    // Normalización de datos antes de enviar
    const payload: Producto = {
      ...this.productoForm,
      stockActual: Number(this.productoForm.stockActual),
      stockMinimo: Number(this.productoForm.stockMinimo),
      precioCompra: Number(this.productoForm.precioCompra),
      precioVenta: Number(this.productoForm.precioVenta),
      fechaVencimiento: this.productoForm.fechaVencimiento || null
    };

    const operation$ = this.editingProducto
      ? this.productoService.updateProducto(this.editingProducto.id!, payload)
      : this.productoService.createProducto(payload);

    operation$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.showForm = false;
          this.editingProducto = null;
          this.productoForm = this.getEmptyProducto();
          this.loadProductos();
          this.loading = false; // Reset loading state

          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto guardado correctamente' });
        },
        error: (err) => {
          this.loading = false;
          console.error('Error al guardar producto:', err);

          let errorMessage = 'No se pudo guardar el producto. Verifica los datos.';

          if (err.status === 409) {
            errorMessage = 'El código del producto ya existe. Use otro diferente.';
          } else if (typeof err.error === 'string') {
            errorMessage = err.error;
          } else if (err?.error?.message) {
            errorMessage = err.error.message;
          }

          this.messageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
        }
      });
  }

  // ==================== ELIMINAR ====================
  deleteProducto(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;

    this.productoService.deleteProducto(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto eliminado del inventario' });
          this.loadProductos();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar el producto' })
      });
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingProducto = null;
    this.productoForm = this.getEmptyProducto();
  }

  onProductoSaved(): void {
    this.showForm = false;
    this.editingProducto = null;
    this.productoForm = this.getEmptyProducto();
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Operación realizada correctamente' });
    this.loadProductos();
  }

  // ==================== VALIDACIÓN ====================
  private isFormValid(): boolean {
    return !!(
      this.productoForm.codigo?.trim() &&
      this.productoForm.nombre?.trim() &&
      this.productoForm.precioVenta > 0 &&
      this.productoForm.categoria?.id > 0 &&
      this.productoForm.laboratorio?.id > 0
    );
  }
}
