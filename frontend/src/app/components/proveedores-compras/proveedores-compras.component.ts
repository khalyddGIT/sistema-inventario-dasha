import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { CompraService } from '../../services/compra.service';
import { ProveedorService } from '../../services/proveedor.service';
import { Producto } from '../../models/producto';
import { Compra, DetalleCompra } from '../../models/compra';
import { Proveedor } from '../../models/proveedor';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-proveedores-compras',
  templateUrl: './proveedores-compras.component.html',
  styleUrls: ['./proveedores-compras.component.css']
})
export class ProveedoresComprasComponent implements OnInit {
  // Formulario de compra
  compra: Compra = {
    fecha: new Date().toISOString().split('T')[0],
    total: 0,
    proveedor: {} as Proveedor, // Inicializado vacío, se completará al registrar
    detalles: []
  };
  selectedProveedorId: number = 0; // Para manejar la selección en el dropdown

  // Formulario de proveedor
  proveedor: Proveedor = {
    id: 0,
    nombre: '',
    contacto: '',
    telefono: '',
    direccion: ''
  };

  // Listas
  productos: Producto[] = [];
  proveedores: Proveedor[] = [];
  compras: Compra[] = [];

  // Variables auxiliares
  selectedProducto: Producto | null = null;
  cantidad: number = 1;
  precioUnitario: number = 0;
  searchTerm: string = '';
  filteredProductos: Producto[] = [];
  loading = false;
  showFormProveedor = false;
  editingProveedor: boolean = false;
  proveedorForm: Proveedor = {
    id: 0,
    nombre: '',
    contacto: '',
    telefono: '',
    direccion: ''
  };

  constructor(
    private productoService: ProductoService,
    private compraService: CompraService,
    private proveedorService: ProveedorService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadProductos();
    this.loadProveedores();
  }

  loadProductos(): void {
    this.productoService.getAllProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.filteredProductos = [...productos];
      },
      error: (error) => {
        console.error('Error al cargar productos', error);
      }
    });
  }

  searchProveedorTerm: string = '';
  filteredProveedores: Proveedor[] = [];

  loadProveedores(): void {
    this.proveedorService.getAllProveedores().subscribe({
      next: (proveedores) => {
        this.proveedores = proveedores;
        this.filteredProveedores = [...proveedores];
      },
      error: (error) => {
        console.error('Error al cargar proveedores', error);
        this.proveedores = [];
        this.filteredProveedores = [];
      }
    });
  }

  filterProveedores(): void {
    const term = this.searchProveedorTerm.trim().toLowerCase();
    if (!term) {
      this.filteredProveedores = [...this.proveedores];
    } else {
      this.filteredProveedores = this.proveedores.filter(p =>
        p.nombre?.toLowerCase().includes(term) ||
        p.contacto?.toLowerCase().includes(term) ||
        p.telefono?.toLowerCase().includes(term) ||
        p.direccion?.toLowerCase().includes(term)
      );
    }
  }

  getProveedoresConContactoCount(): number {
    return this.proveedores.filter(p => p.contacto && p.contacto.trim().length > 0).length;
  }

  getProveedoresConDireccionCount(): number {
    return this.proveedores.filter(p => p.direccion && p.direccion.trim().length > 0).length;
  }

  filterProductos(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredProductos = this.productos;
    } else {
      this.filteredProductos = this.productos.filter(producto =>
        producto.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        producto.codigo.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  selectProducto(producto: Producto): void {
    this.precioUnitario = producto.precioCompra;
    this.selectedProducto = producto;
    this.searchTerm = '';
    this.filteredProductos = this.productos;
  }

  addDetalle(): void {
    if (!this.selectedProducto) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Seleccione un producto primero' });
      return;
    }

    if (this.cantidad <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'La cantidad debe ser mayor a 0' });
      return;
    }

    if (this.precioUnitario <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'El precio unitario debe ser mayor a 0' });
      return;
    }

    // Check if product is already in the purchase
    const existingDetalle = this.compra.detalles.find(d => d.producto.id === this.selectedProducto!.id);

    if (existingDetalle) {
      // If already exists, just update the cantidad and price
      existingDetalle.cantidad += this.cantidad;
      existingDetalle.precioUnitario = this.precioUnitario;
    } else {
      // If new product, add it to the purchase
      const detalle: DetalleCompra = {
        cantidad: this.cantidad,
        precioUnitario: this.precioUnitario,
        producto: this.selectedProducto
      };
      this.compra.detalles.push(detalle);
    }

    this.calculateTotal();

    // Reset selection
    this.selectedProducto = null;
    this.cantidad = 1;
    this.precioUnitario = 0;
  }

  removeDetalle(index: number): void {
    this.compra.detalles.splice(index, 1);
    this.calculateTotal();
  }

  updateDetalle(index: number): void {
    const detalle = this.compra.detalles[index];
    if (detalle.cantidad < 1) {
      detalle.cantidad = 1;
    }
    this.calculateTotal();
  }

  quickAddProducto(producto: Producto): void {
    const existingDetalle = this.compra.detalles.find(d => d.producto.id === producto.id);
    if (existingDetalle) {
      existingDetalle.cantidad += 1;
    } else {
      const detalle: DetalleCompra = {
        cantidad: 1,
        precioUnitario: producto.precioCompra > 0 ? producto.precioCompra : 10,
        producto: producto
      };
      this.compra.detalles.push(detalle);
    }
    this.calculateTotal();
    this.messageService.add({
      severity: 'info',
      summary: 'Producto agregado',
      detail: `"${producto.nombre}" agregado a la compra.`,
      life: 2000
    });
  }

  incrementCantidad(index: number, delta: number): void {
    const detalle = this.compra.detalles[index];
    if (detalle) {
      detalle.cantidad += delta;
      if (detalle.cantidad < 1) {
        detalle.cantidad = 1;
      }
      this.calculateTotal();
    }
  }

  getTotalUnits(): number {
    return this.compra.detalles.reduce((sum, d) => sum + (d.cantidad || 0), 0);
  }

  getSelectedProveedor(): Proveedor | undefined {
    return this.proveedores.find(p => p.id === this.selectedProveedorId);
  }

  calculateTotal(): void {
    this.compra.total = this.compra.detalles.reduce((sum, detalle) => {
      return sum + (detalle.cantidad * detalle.precioUnitario);
    }, 0);
  }

  registrarCompra(): void {
    if (this.compra.detalles.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Debe agregar al menos un producto a la compra' });
      return;
    }

    if (!this.selectedProveedorId) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Debe seleccionar un proveedor' });
      return;
    }

    // Encontrar el proveedor seleccionado y asignarlo al objeto compra
    const proveedorSeleccionado = this.proveedores.find(p => p.id === this.selectedProveedorId);
    if (!proveedorSeleccionado) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Proveedor no encontrado' });
      return;
    }

    this.compra.proveedor = proveedorSeleccionado;

    this.loading = true;
    this.compraService.createCompra(this.compra).subscribe({
      next: (compra) => {
        this.loading = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Compra registrada exitosamente' });
        this.compras.unshift(compra); // Add to the beginning of the list
        this.resetCompra();
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al registrar la compra' });
        console.error(error);
      }
    });
  }

  resetCompra(): void {
    this.compra = {
      fecha: new Date().toISOString().split('T')[0],
      total: 0,
      proveedor: {} as Proveedor,
      detalles: []
    };
    this.selectedProveedorId = 0;
    this.selectedProducto = null;
    this.cantidad = 1;
    this.precioUnitario = 0;
  }

  submittedProveedor = false;

  // Métodos para gestión de proveedores
  openCreateProveedor(): void {
    this.editingProveedor = false;
    this.submittedProveedor = false;
    this.proveedorForm = {
      id: 0,
      nombre: '',
      contacto: '',
      telefono: '',
      direccion: ''
    };
    this.showFormProveedor = true;
  }

  openEditProveedor(proveedor: Proveedor): void {
    this.editingProveedor = true;
    this.submittedProveedor = false;
    this.proveedorForm = { ...proveedor };
    this.showFormProveedor = true;
  }

  saveProveedorWithValidation(): void {
    this.submittedProveedor = true;
    this.saveProveedor();
  }

  saveProveedor(): void {
    if (!this.proveedorForm.nombre?.trim() || !this.proveedorForm.telefono?.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'Complete los campos obligatorios (Nombre y Teléfono)' });
      return;
    }

    if (this.editingProveedor) {
      // Actualizar proveedor existente
      this.proveedorService.updateProveedor(this.proveedorForm.id, this.proveedorForm).subscribe({
        next: (proveedorActualizado) => {
          // Actualizar la lista local
          const index = this.proveedores.findIndex(p => p.id === proveedorActualizado.id);
          if (index !== -1) {
            this.proveedores[index] = proveedorActualizado;
          }
          this.filterProveedores();
          this.showFormProveedor = false;
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proveedor actualizado exitosamente' });
        },
        error: (error) => {
          console.error('Error al actualizar proveedor', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar proveedor' });
        }
      });
    } else {
      // Crear nuevo proveedor
      this.proveedorService.createProveedor(this.proveedorForm).subscribe({
        next: (nuevoProveedor) => {
          this.proveedores.push(nuevoProveedor);
          this.filterProveedores();
          this.showFormProveedor = false;
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proveedor creado exitosamente' });
        },
        error: (error) => {
          console.error('Error al crear proveedor', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear proveedor' });
        }
      });
    }
  }

  deleteProveedor(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este proveedor?')) {
      this.proveedorService.deleteProveedor(id).subscribe({
        next: () => {
          this.proveedores = this.proveedores.filter(p => p.id !== id);
          this.filterProveedores();
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proveedor eliminado exitosamente' });
        },
        error: (error) => {
          console.error('Error al eliminar proveedor', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar proveedor' });
        }
      });
    }
  }

  cancelProveedor(): void {
    this.showFormProveedor = false;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredProductos = this.productos;
  }
}