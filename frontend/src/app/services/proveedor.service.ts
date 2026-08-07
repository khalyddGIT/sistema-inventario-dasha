import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Proveedor } from '../models/proveedor';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  constructor(private http: HttpService) { }

  getAllProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>('/proveedores');
  }

  getProveedorById(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`/proveedores/${id}`);
  }

  createProveedor(proveedor: Proveedor): Observable<Proveedor> {
    return this.http.post<Proveedor>('/proveedores', proveedor);
  }

  updateProveedor(id: number, proveedor: Proveedor): Observable<Proveedor> {
    return this.http.put<Proveedor>(`/proveedores/${id}`, proveedor);
  }

  deleteProveedor(id: number): Observable<void> {
    return this.http.delete<void>(`/proveedores/${id}`);
  }
}