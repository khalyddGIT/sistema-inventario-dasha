// src/app/components/registro/registro.component.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
  providers: [MessageService]
})
export class RegistroComponent {

  nombre: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  selectedRole: string = '';
  loading: boolean = false;

  roles = [
    { label: 'Administrador', value: 'ADMIN' },
    { label: 'Técnico', value: 'TECNICO' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  registrar() {
    this.messageService.clear();

    // Validaciones rápidas
    if (!this.nombre.trim()) return this.msg('error', 'Ingresa tu nombre');
    if (!this.email.trim()) return this.msg('error', 'Ingresa tu email');
    if (!this.password) return this.msg('error', 'Ingresa una contraseña');
    if (this.password.length < 6) return this.msg('error', 'La contraseña debe tener al menos 6 caracteres');
    if (this.password !== this.confirmPassword) return this.msg('error', 'Las contraseñas no coinciden');
    if (!this.selectedRole) return this.msg('error', 'Selecciona tu rol');

    this.loading = true;

    this.authService.registro(
      this.nombre.trim(),
      this.email.trim().toLowerCase(),
      this.password,
      this.selectedRole
    ).subscribe({
      next: (res) => {
        this.loading = false;

        if (res.success) {
          this.msg('success', '¡Cuenta creada con éxito! Bienvenido a Dasha Inventario');

          // REDIRIGE AL LOGIN PARA QUE EL USUARIO PUEDA INICIAR SESIÓN
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);

        } else {
          this.msg('error', res.message || 'No se pudo crear la cuenta');
        }
      },
      error: (err) => {
        this.loading = false;
        let msg = 'Error al conectar con el servidor';
        if (err.error?.message) {
          msg = err.error.message;
        } else if (err.status === 0) {
          msg = 'No hay conexión con el servidor';
        }
        this.msg('error', msg);
      }
    });
  }

  private msg(severity: 'success' | 'error' | 'warn', detail: string) {
    this.messageService.add({
      severity,
      summary: severity === 'success' ? '¡Éxito!' : 'Error',
      detail,
      life: 5000
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}