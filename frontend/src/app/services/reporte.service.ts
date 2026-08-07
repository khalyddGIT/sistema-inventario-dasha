import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from './http.service';

export interface ProductoMasVendido {
  id: number;
  nombre: string;
  codigo: string;
  cantidadVendida: number;
  montoTotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  constructor(private http: HttpService) { }

  getStockBajo(): Observable<any[]> {
    return this.http.get<any[]>(`/productos/stock-bajo`).pipe(
      catchError(() => this.http.get<any[]>(`/reportes/stock-bajo`)),
      catchError(() => of([]))
    );
  }

  getProductosPorVencer(dias?: number): Observable<any[]> {
    return this.http.get<any[]>(`/productos/por-vencer`).pipe(
      catchError(() => this.http.get<any[]>(`/reportes/productos-por-vencer`)),
      catchError(() => of([]))
    );
  }

  getProductosVencidos(): Observable<any[]> {
    return this.http.get<any[]>(`/productos/vencidos`).pipe(
      catchError(() => this.http.get<any[]>(`/reportes/productos-vencidos`)),
      catchError(() => of([]))
    );
  }

  getTotalProductos(): Observable<number> {
    return this.http.get<any[]>(`/productos`).pipe(
      map(prods => prods ? prods.length : 0),
      catchError(() => this.http.get<number>(`/reportes/total-productos`)),
      catchError(() => of(0))
    );
  }

  getStockBajoCount(): Observable<number> {
    return this.http.get<any[]>(`/productos/stock-bajo`).pipe(
      map(prods => prods ? prods.length : 0),
      catchError(() => this.http.get<number>(`/reportes/stock-bajo-count`)),
      catchError(() => of(0))
    );
  }

  getPorVencerCount(): Observable<number> {
    return this.http.get<any[]>(`/productos/por-vencer`).pipe(
      map(prods => prods ? prods.length : 0),
      catchError(() => this.http.get<number>(`/reportes/productos-por-vencer-count`)),
      catchError(() => of(0))
    );
  }

  getVencidosCount(): Observable<number> {
    return this.http.get<any[]>(`/productos/vencidos`).pipe(
      map(prods => prods ? prods.length : 0),
      catchError(() => this.http.get<number>(`/reportes/productos-vencidos-count`)),
      catchError(() => of(0))
    );
  }

  getAllProductos(): Observable<any[]> {
    return this.http.get<any[]>(`/productos`).pipe(
      catchError(() => of([]))
    );
  }

  getStockBajoProductos(): Observable<any[]> {
    return this.http.get<any[]>(`/productos/stock-bajo`).pipe(
      catchError(() => of([]))
    );
  }
}