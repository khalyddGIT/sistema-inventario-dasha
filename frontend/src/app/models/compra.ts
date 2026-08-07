import { Proveedor } from './proveedor';
import { DetalleCompra } from './detallecompra';

// Re-exportamos DetalleCompra para que quien importe Compra también pueda usar DetalleCompra
export type { DetalleCompra };
export { Proveedor };

export interface Compra {
  id?: number;
  fecha: string;
  total: number;
  proveedor: Proveedor;
  detalles: DetalleCompra[];
}