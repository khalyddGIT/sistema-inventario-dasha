import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Producto } from '../../models/producto';
import { Categoria } from '../../models/categoria';
import { Laboratorio } from '../../models/laboratorio';
import { ProductoService } from '../../services/producto.service';
import { HttpService } from '../../services/http.service';
import { MessageService } from 'primeng/api';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-producto-form',
  templateUrl: './productoform.component.html',
  styleUrls: ['./productoform.component.css'],
  providers: [MessageService]
})
export class ProductoFormComponent implements OnInit, OnChanges, OnDestroy {

  @Input() producto: Producto = {
    id: 0,
    codigo: '',
    nombre: '',
    presentacion: '',
    lote: '',
    fechaVencimiento: null,
    stockActual: 0,
    stockMinimo: 10,
    precioCompra: 0.0,
    precioVenta: 0.0,
    categoria: { id: 1, nombre: '' } as Categoria,
    laboratorio: { id: 1, nombre: '' } as Laboratorio
  };

  @Input() isEditing: boolean = false;

  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  selectedCategoriaId: number = 1;
  selectedLaboratorioId: number = 1;

  loading = false;
  codigoDuplicado = false;
  codigoVerificando = false;
  codigoValido = true;

  private codigoSubject = new Subject<string>();

  categorias: Categoria[] = [];
  laboratorios: Laboratorio[] = [];

  constructor(
    private productoService: ProductoService,
    private http: HttpService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadCatalogos();
    this.initSelectedValues();

    this.codigoSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.validarCodigoEnTiempoReal();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['producto'] && this.producto) {
      this.initSelectedValues();
    }
  }

  ngOnDestroy(): void {
    this.codigoSubject.complete();
  }

  private initSelectedValues(): void {
    if (this.producto) {
      if (this.producto.categoria && this.producto.categoria.id) {
        this.selectedCategoriaId = this.producto.categoria.id;
      }
      if (this.producto.laboratorio && this.producto.laboratorio.id) {
        this.selectedLaboratorioId = this.producto.laboratorio.id;
      }
    }
  }

  onCodigoChange(codigo: string): void {
    this.codigoSubject.next(codigo);
  }

  isFormValid(): boolean {
    return !!(
      this.producto.codigo?.trim() &&
      this.producto.nombre?.trim() &&
      this.producto.precioVenta > 0 &&
      this.selectedCategoriaId > 0 &&
      this.selectedLaboratorioId > 0 &&
      !this.codigoDuplicado
    );
  }

  loadCatalogos(): void {
    // Intentar cargar categorías del backend
    this.http.get<Categoria[]>('/categorias').subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.categorias = data;
        } else {
          this.setDefaultCategorias();
        }
      },
      error: () => this.setDefaultCategorias()
    });

    // Intentar cargar laboratorios del backend
    this.http.get<Laboratorio[]>('/laboratorios').subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.laboratorios = data;
        } else {
          this.setDefaultLaboratorios();
        }
      },
      error: () => this.setDefaultLaboratorios()
    });
  }

  private setDefaultCategorias(): void {
    this.categorias = [
      { id: 1, nombre: 'Analgésicos' },
      { id: 2, nombre: 'Antibióticos' },
      { id: 3, nombre: 'Vitaminas' },
      { id: 4, nombre: 'Antihistamínicos' },
      { id: 5, nombre: 'Descongestionantes nasales' }
    ];
  }

  private setDefaultLaboratorios(): void {
    this.laboratorios = [
      { id: 1, nombre: 'Laboratorios Internacionales' },
      { id: 2, nombre: 'Farmacéutica Nacional S.A.' },
      { id: 3, nombre: 'Medicamentos del Perú' },
      { id: 4, nombre: 'Salud Global S.R.L.' },
      { id: 5, nombre: 'FarmaTech' }
    ];
  }

  async validarCodigoEnTiempoReal(): Promise<void> {
    if (!this.producto.codigo?.trim()) {
      this.codigoDuplicado = false;
      this.codigoValido = true;
      return;
    }

    const codigoLimpio = this.producto.codigo.trim();
    this.codigoVerificando = true;

    this.productoService.getAllProductos().subscribe({
      next: (productos) => {
        this.codigoVerificando = false;
        this.codigoDuplicado = productos.some(p =>
          p.codigo?.toLowerCase() === codigoLimpio.toLowerCase() &&
          (!this.isEditing || p.id !== this.producto.id)
        );
        this.codigoValido = !this.codigoDuplicado;
      },
      error: () => {
        this.codigoVerificando = false;
        this.codigoDuplicado = false;
        this.codigoValido = true;
      }
    });
  }

  onSave(): void {
    if (!this.isFormValid()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Por favor complete todos los campos obligatorios (*)'
      });
      return;
    }

    this.guardarProductoFinal();
  }

  private guardarProductoFinal(): void {
    if (this.loading) return;
    this.loading = true;

    const productoToSend: any = {
      ...(this.isEditing && this.producto.id ? { id: this.producto.id } : {}),
      codigo: this.producto.codigo.trim(),
      nombre: this.producto.nombre.trim(),
      presentacion: this.producto.presentacion?.trim() || null,
      lote: this.producto.lote?.trim() || 'LOTE001',
      fechaVencimiento: this.producto.fechaVencimiento || null,
      stockActual: Number(this.producto.stockActual || 0),
      stockMinimo: Number(this.producto.stockMinimo || 10),
      precioCompra: Number(this.producto.precioCompra || 0),
      precioVenta: Number(this.producto.precioVenta || 0),
      categoria: { id: Number(this.selectedCategoriaId) },
      laboratorio: { id: Number(this.selectedLaboratorioId) }
    };

    const operation$ = (this.isEditing && this.producto.id)
      ? this.productoService.updateProducto(this.producto.id, productoToSend)
      : this.productoService.createProducto(productoToSend);

    operation$.subscribe({
      next: () => {
        this.loading = false;
        this.save.emit();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al guardar producto:', err);
        let mensaje = 'No se pudo guardar el producto';
        if (err.status === 409) {
          mensaje = 'El código del producto ya existe';
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: mensaje
        });
      }
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
