import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Compra } from '../models/compra';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class CompraService {

  constructor(private http: HttpService) { }

  getAllCompras(): Observable<Compra[]> {
    return this.http.get<Compra[]>('/compras');
  }

  getCompraById(id: number): Observable<Compra> {
    return this.http.get<Compra>(`/compras/${id}`);
  }

  createCompra(compra: Compra): Observable<Compra> {
    return this.http.post<Compra>('/compras', compra);
  }

  updateCompra(id: number, compra: Compra): Observable<Compra> {
    return this.http.put<Compra>(`/compras/${id}`, compra);
  }

  deleteCompra(id: number): Observable<void> {
    return this.http.delete<void>(`/compras/${id}`);
  }
}