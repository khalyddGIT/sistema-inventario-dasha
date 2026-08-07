package com.inventario.inventory.repository;

import com.inventario.inventory.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    // MÉTODO CORRECTO: stockActual <= stockMinimo
    @Query("SELECT p FROM Producto p WHERE p.stockActual <= p.stockMinimo")
    List<Producto> findProductosStockBajo();

    // Próximos a vencer (próximos 30 días)
    @Query("SELECT p FROM Producto p WHERE p.fechaVencimiento BETWEEN :hoy AND :en30dias")
    List<Producto> findProductosPorVencer(@Param("hoy") LocalDate hoy, @Param("en30dias") LocalDate en30dias);

    // Productos vencidos
    @Query("SELECT p FROM Producto p WHERE p.fechaVencimiento < :hoy AND p.stockActual > 0")
    List<Producto> findProductosVencidos(@Param("hoy") LocalDate hoy);

    // Búsqueda por nombre o código
    List<Producto> findByNombreContainingIgnoreCaseOrCodigoContainingIgnoreCase(String term1, String term2);

    // Próximos a vencer en 15 días
    @Query("SELECT p FROM Producto p WHERE p.fechaVencimiento BETWEEN :desde AND :hasta")
    List<Producto> findProductosPorVencerEn15Dias(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    // Próximos a vencer en 7 días
    @Query("SELECT p FROM Producto p WHERE p.fechaVencimiento BETWEEN :desde AND :hasta")
    List<Producto> findProductosPorVencerEn7Dias(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);
}