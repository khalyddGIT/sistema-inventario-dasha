// src/app/guards/role.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/role';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {

    // 1. Verifica si está logueado
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
      return false;
    }

    // 2. Verifica el rol esperado (si la ruta tiene data['role'])
    const expectedRole = route.data['role'] as Role;

    if (expectedRole) {
      const userRole = this.authService.getCurrentUser()?.rol;

      // ADMIN puede acceder a cualquier rol (jerarquía de permisos)
      if (userRole?.toUpperCase() === 'ADMIN') {
        return true;
      }

      // Verificación normal para otros roles
      if (!userRole || userRole.toUpperCase() !== expectedRole) {
        console.warn(`Acceso denegado. Se esperaba rol: ${expectedRole}, pero tiene: ${userRole}`);
        this.router.navigate(['/dashboard']); // Redirigir al dashboard si no tiene permisos
        return false;
      }
    }

    return true;
  }
}