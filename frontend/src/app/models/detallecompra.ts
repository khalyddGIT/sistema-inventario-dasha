import { Producto } from './producto';

export interface DetalleCompra {
  id?: number;
  cantidad: number;
  precioUnitario: number;
  producto: Producto;
}