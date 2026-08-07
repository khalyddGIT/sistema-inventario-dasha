# Interceptores HTTP de Angular

Guarda en esta carpeta los interceptores para peticiones HTTP:
- `auth.interceptor.ts`: Inyecta el token JWT en las cabeceras `Authorization: Bearer <token>`.
- `error.interceptor.ts`: Maneja errores de respuesta HTTP globales (401, 403, 500).
