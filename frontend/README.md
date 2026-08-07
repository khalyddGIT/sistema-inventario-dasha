# Dasha Inventario - Frontend

Sistema web de gestión de inventariado para la botica "Dasha", una microempresa farmacéutica en Huamanga, Perú.

## Requisitos

- Node.js (v18 o superior)
- Angular CLI (v17 o superior)

## Instalación

1. Asegúrate de tener instalado Node.js y Angular CLI:
```bash
npm install -g @angular/cli
```

2. Clona o descarga este repositorio

3. Navega al directorio del proyecto:
```bash
cd dasha-frontend
```

4. Instala las dependencias:
```bash
npm install
```

## Ejecución

1. Asegúrate de tener el backend de Spring Boot corriendo en `http://localhost:8080`

2. Inicia la aplicación Angular:
```bash
ng serve
```

3. Abre tu navegador en `http://localhost:4200`

## Credenciales de Demo

- **ADMIN**: admin@dasha.com / admin123
- **TECNICO**: tecnico@dasha.com / tecnico123

## Características

- Interfaz responsive diseñada para móviles
- Sistema de roles (ADMIN y TECNICO)
- Gestión de productos, ventas y compras
- Alertas de stock bajo y productos por vencer
- Búsqueda rápida de productos

## Estructura del Proyecto

```
src/app/
├── components/     # Componentes de la interfaz
├── models/         # Modelos TypeScript
├── services/       # Servicios para comunicación con backend
├── guards/         # Guards de rutas
└── ...
```

## Conexión con Backend

La aplicación está configurada para conectarse al backend de Spring Boot en `http://localhost:8080`.
Si necesitas cambiar la URL del backend, modifica las propiedades `apiUrl` en los servicios.

## Funcionalidades Disponibles

- Login/logout de usuarios
- Dashboard con alertas de inventario
- Listado y búsqueda de productos
- Registro de ventas (disponible para ADMIN y TECNICO)
- Registro de compras (solo para ADMIN)
- Alertas de productos con stock bajo
- Alertas de productos por vencer