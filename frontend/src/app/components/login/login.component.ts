// src/app/components/login/login.component.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  // Datos del formulario
  email: string = '';
  password: string = '';

  // Estado de la UI
  loading: boolean = false;
  error: string = '';
  currentYear = new Date().getFullYear();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Si ya está logueado → redirigir directamente
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ingresoDirecto(): void {
    this.authService.setDefaultAdminUser();
    this.router.navigate(['/dashboard']);
  }

  login(): void {
    this.error = '';
    this.loading = true;

    // Validación básica
    if (!this.email || !this.password) {
      this.error = 'Por favor ingresa tu email y contraseña';
      this.loading = false;
      return;
    }

    // Validación de formato de email
    if (!this.isValidEmail(this.email)) {
      this.error = 'Por favor ingresa un email válido';
      this.loading = false;
      return;
    }

    // Validación de longitud de contraseña
    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      this.loading = false;
      return;
    }

    // Llamar al servicio de login
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.loading = false;

        if (response && response.success && response.usuario) {
          // El servicio ya guardó el usuario automáticamente
          this.router.navigate(['/dashboard']);
        } else {
          this.error = response?.message || 'Credenciales inválidas';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error de conexión. Intenta de nuevo más tarde.';
        console.error('Error en login:', err);
      }
    });
  }

  onForgotPassword(event: Event): void {
    event.preventDefault();
    // Mostrar un mensaje o redirigir a la página de recuperación de contraseña
    alert('La funcionalidad de recuperación de contraseña está en desarrollo. Por favor contacta al administrador.');
    // En una implementación real, redirigirías a /forgot-password
    // this.router.navigate(['/forgot-password']);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Método para manejar el inicio de sesión con tecla Enter
  onKeyPress(event: any): void {
    // Asegurarse de que es un KeyboardEvent o tiene las propiedades necesarias
    const key = event.key || event.code;
    if (key === 'Enter') {
      event.preventDefault();
      if (!this.loading && this.email && this.password) {
        this.login();
      }
    }
  }
}