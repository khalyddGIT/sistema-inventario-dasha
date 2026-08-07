package com.inventario.inventory.service;

import com.inventario.inventory.model.Producto;
import com.inventario.inventory.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    public List<Producto> getAllProductos() {
        return productoRepository.findAll();
    }

    public Optional<Producto> getProductoById(Long id) {
        return productoRepository.findById(id);
    }

    public Producto createProducto(Producto producto) {
        return productoRepository.save(producto);
    }

    public Producto updateProducto(Long id, Producto producto) {
        if (productoRepository.existsById(id)) {
            producto.setId(id);
            return productoRepository.save(producto);
        }
        return null;
    }

    public boolean deleteProducto(Long id) {
        if (productoRepository.existsById(id)) {
            productoRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // MÉTODO CORRECTO PARA EL DASHBOARD
    public List<Producto> getProductosStockBajo() {
        return productoRepository.findProductosStockBajo();
    }

    // Próximos a vencer (próximos 30 días)
    public List<Producto> getProductosPorVencer() {
        LocalDate hoy = LocalDate.now();
        LocalDate en30dias = hoy.plusDays(30);
        return productoRepository.findProductosPorVencer(hoy, en30dias);
    }

    // Ya vencidos
    public List<Producto> getProductosVencidos() {
        return productoRepository.findProductosVencidos(LocalDate.now());
    }

    // Búsqueda por nombre o código
    public List<Producto> searchProductos(String term) {
        return productoRepository.findByNombreContainingIgnoreCaseOrCodigoContainingIgnoreCase(term, term);
    }

    // Próximos a vencer en 15 días
    public List<Producto> getProductosPorVencer15Dias() {
        LocalDate hoy = LocalDate.now();
        LocalDate desde = hoy.plusDays(14);  // Día 15 desde hoy
        LocalDate hasta = hoy.plusDays(15);  // Día 16 desde hoy
        return productoRepository.findProductosPorVencerEn15Dias(desde, hasta);
    }

    // Próximos a vencer en 7 días
    public List<Producto> getProductosPorVencer7Dias() {
        LocalDate hoy = LocalDate.now();
        LocalDate desde = hoy.plusDays(6);   // Día 7 desde hoy
        LocalDate hasta = hoy.plusDays(7);   // Día 8 desde hoy
        return productoRepository.findProductosPorVencerEn7Dias(desde, hasta);
    }

    // Actualizar stock al comprar
    public Producto actualizarStockCompra(Long productoId, Integer cantidad) {
        return productoRepository.findById(productoId).map(producto -> {
            producto.setStockActual(producto.getStockActual() + cantidad);
            return productoRepository.save(producto);
        }).orElse(null);
    }
}