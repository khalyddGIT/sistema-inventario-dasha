import { Component, OnInit } from '@angular/core';
import { CompraService } from '../../services/compra.service';
import { Compra } from '../../models/compra';
import { Producto } from '../../models/producto';

@Component({
  selector: 'app-historial-compras',
  templateUrl: './historial-compras.component.html',
  styleUrls: ['./historial-compras.component.css']
})
export class HistorialComprasComponent implements OnInit {
  compras: Compra[] = [];
  filteredCompras: Compra[] = [];
  loading = true;
  searchTerm = '';
  showDetallesDialog = false;
  selectedCompra: Compra | null = null;

  constructor(private compraService: CompraService) {}

  ngOnInit(): void {
    this.loadCompras();
  }

  loadCompras(): void {
    this.loading = true;
    this.compraService.getAllCompras().subscribe({
      next: (compras) => {
        this.compras = compras;
        this.filteredCompras = [...compras];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar el historial de compras:', err);
        this.loading = false;
      }
    });
  }

  filterCompras(): void {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredCompras = [...this.compras];
      return;
    }

    this.filteredCompras = this.compras.filter(compra => 
      compra.id?.toString().includes(term) ||
      compra.fecha.toLowerCase().includes(term) ||
      compra.proveedor.nombre.toLowerCase().includes(term) ||
      compra.total.toString().includes(term) ||
      compra.detalles.some(detalle => 
        detalle.producto.nombre.toLowerCase().includes(term) ||
        detalle.producto.codigo.toLowerCase().includes(term)
      )
    );
  }

  getDetalleProductos(detalleCompra: any[]): string {
    return detalleCompra.map(d => d.producto.nombre).join(', ');
  }

  getDetalleCantidades(detalleCompra: any[]): string {
    return detalleCompra.map(d => `${d.cantidad} x S/.${d.precioUnitario.toFixed(2)}`).join(', ');
  }

  showDetalles(compra: Compra): void {
    this.selectedCompra = compra;
    this.showDetallesDialog = true;
  }

  deleteCompra(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar esta compra? Esta acción no se puede deshacer.')) {
      this.compraService.deleteCompra(id).subscribe({
        next: () => {
          this.compras = this.compras.filter(c => c.id !== id);
          this.filteredCompras = this.filteredCompras.filter(c => c.id !== id);
        },
        error: (err) => {
          console.error('Error al eliminar la compra:', err);
          alert('No se pudo eliminar la compra');
        }
      });
    }
  }
}