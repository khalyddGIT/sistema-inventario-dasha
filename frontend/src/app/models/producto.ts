// src/app/models/producto.ts

export interface Categoria {
  id: number;
  nombre: string;
}

export interface Laboratorio {
  id: number;
  nombre: string;
}

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  presentacion?: string;
  lote: string;
  fechaVencimiento: string | null;     // ← AQUÍ ESTABA EL ERROR: ahora acepta null
  stockActual: number;
  stockMinimo: number;
  precioCompra: number;
  precioVenta: number;
  categoria: { id: number; nombre: string };
  laboratorio: { id: number; nombre: string };
}