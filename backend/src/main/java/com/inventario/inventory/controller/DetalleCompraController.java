package com.inventario.inventory.controller;

import com.inventario.inventory.model.DetalleCompra;
import com.inventario.inventory.service.DetalleCompraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/detalles-compra")
@CrossOrigin(origins = "http://localhost:4200")
public class DetalleCompraController {
    
    @Autowired
    private DetalleCompraService detalleCompraService;
    
    @GetMapping
    public ResponseEntity<List<DetalleCompra>> getAllDetallesCompra() {
        List<DetalleCompra> detallesCompra = detalleCompraService.getAllDetallesCompra();
        return new ResponseEntity<>(detallesCompra, HttpStatus.OK);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<DetalleCompra> getDetalleCompraById(@PathVariable Long id) {
        Optional<DetalleCompra> detalleCompra = detalleCompraService.getDetalleCompraById(id);
        return detalleCompra.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @PostMapping
    public ResponseEntity<DetalleCompra> createDetalleCompra(@RequestBody DetalleCompra detalleCompra) {
        DetalleCompra createdDetalleCompra = detalleCompraService.createDetalleCompra(detalleCompra);
        return new ResponseEntity<>(createdDetalleCompra, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<DetalleCompra> updateDetalleCompra(@PathVariable Long id, @RequestBody DetalleCompra detalleCompra) {
        DetalleCompra updatedDetalleCompra = detalleCompraService.updateDetalleCompra(id, detalleCompra);
        if (updatedDetalleCompra != null) {
            return new ResponseEntity<>(updatedDetalleCompra, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDetalleCompra(@PathVariable Long id) {
        boolean deleted = detalleCompraService.deleteDetalleCompra(id);
        if (deleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}