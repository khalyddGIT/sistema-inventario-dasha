import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(private http: HttpService) { }

  getAllProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>('/productos');
  }

  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`/productos/${id}`);
  }

  createProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>('/productos', producto);
  }

  updateProducto(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`/productos/${id}`, producto);
  }

  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`/productos/${id}`);
  }

  getProductosStockBajo(): Observable<Producto[]> {
    return this.http.get<Producto[]>('/productos/stock-bajo');
  }

  getProductosPorVencer(): Observable<Producto[]> {
    return this.http.get<Producto[]>('/productos/por-vencer');
  }

  getProductosPorVencer15Dias(): Observable<Producto[]> {
    return this.http.get<Producto[]>('/productos/por-vencer/15-dias');
  }

  getProductosPorVencer7Dias(): Observable<Producto[]> {
    return this.http.get<Producto[]>('/productos/por-vencer/7-dias');
  }

  getProductosVencidos(): Observable<Producto[]> {
    return this.http.get<Producto[]>('/productos/vencidos');
  }

  searchProductos(nombre: string): Observable<Producto[]> {
    const params = new URLSearchParams({ term: nombre });
    const queryString = params.toString();
    return this.http.get<Producto[]>(`/productos/search?${queryString}`);
  }
}