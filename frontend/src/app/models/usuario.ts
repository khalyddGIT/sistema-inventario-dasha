// src/app/models/usuario.ts
import { Role } from './role';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Role;
  // ¡NUNCA guardamos password en el frontend!
}