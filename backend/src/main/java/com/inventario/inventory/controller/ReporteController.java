package com.inventario.inventory.controller;

import com.inventario.inventory.model.Producto;
import com.inventario.inventory.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    @Autowired
    private ProductoService productoService;

    @GetMapping("/stock-bajo")
    public ResponseEntity<List<Producto>> getStockBajo() {
        return ResponseEntity.ok(productoService.getProductosStockBajo());
    }

    @GetMapping("/productos-por-vencer")
    public ResponseEntity<List<Producto>> getProductosPorVencer() {
        return ResponseEntity.ok(productoService.getProductosPorVencer());
    }

    @GetMapping("/productos-vencidos")
    public ResponseEntity<List<Producto>> getProductosVencidos() {
        return ResponseEntity.ok(productoService.getProductosVencidos());
    }

    @GetMapping("/total-productos")
    public ResponseEntity<Integer> getTotalProductos() {
        return ResponseEntity.ok(productoService.getAllProductos().size());
    }

    @GetMapping("/stock-bajo-count")
    public ResponseEntity<Integer> getStockBajoCount() {
        return ResponseEntity.ok(productoService.getProductosStockBajo().size());
    }

    @GetMapping("/productos-por-vencer-count")
    public ResponseEntity<Integer> getPorVencerCount() {
        return ResponseEntity.ok(productoService.getProductosPorVencer().size());
    }

    @GetMapping("/productos-vencidos-count")
    public ResponseEntity<Integer> getVencidosCount() {
        return ResponseEntity.ok(productoService.getProductosVencidos().size());
    }
}
