# Documentación de Errores y Soluciones de Despliegue
**Proyecto:** Sistema de Inventario Dasha  
**Arquitectura:** Angular (Vercel) + Spring Boot 3 / Java 17 (Render) + PostgreSQL (Supabase)  
**Fecha de Resolución:** 7 de Agosto, 2026  

---

## Índice
1. [Resumen General](#1-resumen-general)
2. [Error 1: Conexión BD e Incompatibilidad de IPv6 de Render con Supabase](#error-1-conexión-bd-e-incompatibilidad-de-ipv6-de-render-con-supabase)
3. [Error 2: Fallo de Puerto Dinámico en Dockerfile para Render](#error-2-fallo-de-puerto-dinámico-en-dockerfile-para-render)
4. [Error 3: Incompatibilidad del Dialecto Hibernate entre MySQL y PostgreSQL](#error-3-incompatibilidad-del-dialecto-hibernate-entre-mysql-y-postgresql)
5. [Error 4: Fallo de Serialización JSON en Proxies LAZY de Hibernate](#error-4-fallo-de-serialización-json-en-proxies-lazy-de-hibernate)
6. [Error 5: Conflicto de CORS entre `@CrossOrigin("*")` y `allowCredentials(true)`](#error-5-conflicto-de-cors-entre-crossorigin-y-allowcredentialstrue)
7. [Resumen de Arquitectura Final y Buenas Prácticas](#7-resumen-de-arquitectura-final-y-buenas-prácticas)

---

## 1. Resumen General

Durante el despliegue a producción del proyecto **Sistema de Inventario**, la integración entre el frontend (Vercel), backend (Render Docker) y base de datos (Supabase PostgreSQL) experimentó varios fallos en cadena, manifestados principalmente como errores **HTTP 500 (Internal Server Error)** y **net::ERR_FAILED / CORS Policy**.

Mediante una estrategia de diagnóstico basada en logs de excepciones en vivo y configuración estricta, se corrigieron todos los puntos de fallo.

---

## Error 1: Conexión BD e Incompatibilidad de IPv6 de Render con Supabase

### ❌ El Problema
Los servicios gratuitos de Render no soportan direccionamiento IPv6 directo. Al intentar conectar Spring Boot con el host directo de Supabase (`db.<ref>.supabase.co:5432`), la aplicación arrojaba:
```text
java.net.SocketException: Network is unreachable
```

### 💡 La Solución
Se migró la conexión al **IPv4 Transaction Pooler** de Supabase utilizando el puerto `6543` y ajustando la nomenclatura del usuario a `postgres.<ref>`.

- **Host Pooler:** `aws-0-us-east-1.pooler.supabase.com`
- **Puerto:** `6543`
- **Usuario:** `postgres.ygznguviubojlbanpqqi`
- **JDBC URL:** `jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require`

---

## Error 2: Fallo de Puerto Dinámico en Dockerfile para Render

### ❌ El Problema
Render asigna un puerto dinámico mediante la variable de entorno `$PORT`. La forma ejecutiva previa en `Dockerfile` no expandía la variable de entorno en el binario Java:
```dockerfile
# Incorrecto (no expande $PORT)
ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-jar", "app.jar"]
```
Esto causaba que el contenedor escuchara en el puerto por defecto `8080` mientras Render esperaba respuesta en el puerto asignado dinámicamente.

### 💡 La Solución
Se actualizó el `ENTRYPOINT` del `backend/Dockerfile` para ejecutar un subshell `sh -c` que expande las variables de entorno correctamente:
```dockerfile
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -Dspring.profiles.active=prod -jar app.jar"]
```

---

## Error 3: Incompatibilidad del Dialecto Hibernate entre MySQL y PostgreSQL

### ❌ El Problema
El archivo base `application.properties` mantenía por defecto el dialecto `MySQLDialect`. Al conectar el backend con Supabase PostgreSQL, Hibernate generaba consultas SQL sintácticamente incompatibles (como tipos `AUTO_INCREMENT` vs `IDENTITY`/`SERIAL`), lanzando errores 500 al ejecutar `findAll()`.

### 💡 La Solución
Se actualizaron los valores por defecto en `application.properties` y en `render.yaml`:
```properties
spring.datasource.driver-class-name=${DATABASE_DRIVER:org.postgresql.Driver}
spring.jpa.properties.hibernate.dialect=${JPA_DIALECT:org.hibernate.dialect.PostgreSQLDialect}
```

---

## Error 4: Fallo de Serialización JSON en Proxies LAZY de Hibernate

### ❌ El Problema
Al listar entidades con relaciones cargadas perezosamente (`FetchType.LAZY`) como `Producto` (con `Categoria` y `Laboratorio`), Jackson (el serializador JSON de Spring Boot) intentaba serializar los objetos Proxy internos de Hibernate (`hibernateLazyInitializer` y `handler`), generando un desbordamiento o excepción `InvalidDefinitionException` (Error HTTP 500).

### 💡 La Solución
1. Se añadieron las anotaciones `@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})` en las relaciones de las entidades (`Producto.java`, `Compra.java` y `DetalleCompra.java`).
2. Se configuró un Mixin global en `JacksonConfig.java`.

---

## Error 5: Conflicto de CORS entre `@CrossOrigin("*")` y `allowCredentials(true)`

### ❌ El Problema (Error Final)
La aplicación devolvía la siguiente excepción al cargar cualquier endpoint (`/api/productos`, `/api/proveedores`):
```json
{
  "status": 500,
  "error": "Internal Server Error",
  "message": "When allowCredentials is true, allowedOrigins cannot contain the special value \"*\" since that cannot be set on the \"Access-Control-Allow-Origin\" response header."
}
```

**Causa Raíz:** En la configuración global (`SecurityConfig.java`) teníamos habilitado `allowCredentials(true)` con patrones dinámicos (`setAllowedOriginPatterns("*")`), pero en los controladores REST individuales existía la anotación `@CrossOrigin(origins = "*")`. 

Al fusionar ambas reglas, Spring Boot rechazaba el comodín `*` en presencia de credenciales permitidas.

### 💡 La Solución
Se eliminaron las anotaciones `@CrossOrigin(origins = "*")` de todos los controladores REST (`ProductoController`, `ProveedorController`, `CategoriaController`, `LaboratorioController`, `AuthController`, `DetalleCompraController`, `ReporteController`) y se centralizó la gestión de CORS únicamente en `SecurityConfig.java` y `WebConfig.java`:

```java
// SecurityConfig.java
.cors(cors -> cors.configurationSource(request -> {
    var config = new org.springframework.web.cors.CorsConfiguration();
    config.setAllowedOriginPatterns(java.util.List.of("*"));
    config.setAllowedMethods(java.util.List.of("GET","POST","PUT","DELETE","OPTIONS","PATCH"));
    config.setAllowedHeaders(java.util.List.of("*"));
    config.setAllowCredentials(true);
    return config;
}))
```

---

## 7. Resumen de Arquitectura Final y Buenas Prácticas

1. **Gestión de Errores Transparente:** La implementación de `GlobalExceptionHandler.java` permitió capturar y exponer la causa raíz exacta en formato JSON para diagnósticos rápidos en producción.
2. **CORS Centralizado:** Nunca combinar `@CrossOrigin(origins = "*")` a nivel de controlador si se requiere `allowCredentials(true)` a nivel de Spring Security; usar `setAllowedOriginPatterns` centralizado.
3. **Hibernate Proxy Hygiene:** Siempre omitir propiedades internas de proxies LAZY con `@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})` para evitar fallos de serialización JSON.
