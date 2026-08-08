package com.inventario.inventory.controller;

import com.inventario.inventory.model.Producto;
import com.inventario.inventory.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    // ==================== LISTAR ====================
    @GetMapping
    public ResponseEntity<List<Producto>> getAllProductos() {
        return ResponseEntity.ok(productoService.getAllProductos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> getProductoById(@PathVariable Long id) {
        return productoService.getProductoById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==================== CREAR (CORREGIDO) ====================
    @PostMapping
    public ResponseEntity<?> createProducto(@RequestBody Producto producto) {
        try {
            Producto nuevo = productoService.createProducto(producto);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("El código del producto ya existe");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno al guardar el producto");
        }
    }

    // ==================== ACTUALIZAR ====================
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProducto(@PathVariable Long id,
                                            @RequestBody Producto producto) {
        try {
            Producto updated = productoService.updateProducto(id, producto);
            return updated != null
                    ? ResponseEntity.ok(updated)
                    : ResponseEntity.notFound().build();

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Código duplicado");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno al actualizar");
        }
    }

    // ==================== ELIMINAR ====================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProducto(@PathVariable Long id) {
        try {
            return productoService.deleteProducto(id)
                    ? ResponseEntity.noContent().build()
                    : ResponseEntity.notFound().build();

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("No se pudo eliminar el producto");
        }
    }

    // ==================== REPORTES ====================
    @GetMapping("/stock-bajo")
    public ResponseEntity<List<Producto>> getProductosStockBajo() {
        return ResponseEntity.ok(productoService.getProductosStockBajo());
    }

    @GetMapping("/por-vencer")
    public ResponseEntity<List<Producto>> getProductosPorVencer() {
        return ResponseEntity.ok(productoService.getProductosPorVencer());
    }

    @GetMapping("/vencidos")
    public ResponseEntity<List<Producto>> getProductosVencidos() {
        return ResponseEntity.ok(productoService.getProductosVencidos());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Producto>> searchProductos(@RequestParam String term) {
        return ResponseEntity.ok(productoService.searchProductos(term));
    }

    @GetMapping("/por-vencer/15-dias")
    public ResponseEntity<List<Producto>> getProductosPorVencer15Dias() {
        return ResponseEntity.ok(productoService.getProductosPorVencer15Dias());
    }

    @GetMapping("/por-vencer/7-dias")
    public ResponseEntity<List<Producto>> getProductosPorVencer7Dias() {
        return ResponseEntity.ok(productoService.getProductosPorVencer7Dias());
    }
}
