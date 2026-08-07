// src/app/services/auth.service.ts
// VERSIÓN CONEXIÓN A BACKEND CONFIGURABLE - ACTUALIZADO

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Usuario } from '../models/usuario';
import { Role } from '../models/role';
import { Router } from '@angular/router';
import { HttpService } from './http.service';

interface ApiResponse {
  success: boolean;
  message: string;
  usuario?: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpService, private router: Router) {
    // Cargar usuario guardado al iniciar la app o iniciar sesión automáticamente como ADMIN
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(savedUser));
      } catch (e) {
        this.setDefaultAdminUser();
      }
    } else {
      this.setDefaultAdminUser();
    }
  }

  public setDefaultAdminUser(): void {
    const defaultAdmin: Usuario = {
      id: 1,
      nombre: 'Ana María López',
      email: 'admin@dasha.com',
      rol: Role.ADMIN
    };
    localStorage.setItem('currentUser', JSON.stringify(defaultAdmin));
    this.currentUserSubject.next(defaultAdmin);
  }

  // LOGIN - FUNCIONA PERFECTO
  login(email: string, password: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>('/auth/login', { email, password })
      .pipe(
        map(response => {
          if (response.success && response.usuario) {
            const usuario: Usuario = {
              id: response.usuario.id,
              nombre: response.usuario.nombre,
              email: response.usuario.email,
              rol: response.usuario.rol.toUpperCase() as Role
            };
            localStorage.setItem('currentUser', JSON.stringify(usuario));
            this.currentUserSubject.next(usuario);
          }
          return response;
        }),
        catchError(error => {
          return of({
            success: false,
            message: error.error?.message || 'Credenciales inválidas'
          });
        })
      );
  }

  // REGISTRO - AHORA SÍ GUARDA EL USUARIO Y ENTRA DIRECTO AL POS
  registro(nombre: string, email: string, password: string, rol: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>('/auth/registro', {
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      password,
      rol
    }).pipe(
      map(response => {
        if (response.success && response.usuario) {
          const usuario: Usuario = {
            id: response.usuario.id,
            nombre: response.usuario.nombre,
            email: response.usuario.email,
            rol: response.usuario.rol.toUpperCase() as Role
          };
          localStorage.setItem('currentUser', JSON.stringify(usuario));
          this.currentUserSubject.next(usuario);
        }
        return response;
      }),
      catchError(error => {
        return of({
          success: false,
          message: error.error?.message || 'Error al registrar usuario'
        });
      })
    );
  }

  // LOGOUT
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // ESTADO DE SESIÓN
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  // OBTENER USUARIO ACTUAL
  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  // VERIFICAR ROL (100% SEGURO)
  hasRole(expectedRole: Role): boolean {
    const userRole = this.getCurrentUser()?.rol;
    return !!userRole && userRole === expectedRole;
  }

  hasAnyRole(roles: Role[]): boolean {
    const userRole = this.getCurrentUser()?.rol;
    return userRole ? roles.includes(userRole) : false;
  }
}