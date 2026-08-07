package com.inventario.inventory.service;

import com.inventario.inventory.model.DetalleCompra;
import com.inventario.inventory.repository.DetalleCompraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class DetalleCompraService {
    
    @Autowired
    private DetalleCompraRepository detalleCompraRepository;
    
    public List<DetalleCompra> getAllDetallesCompra() {
        return detalleCompraRepository.findAll();
    }
    
    public Optional<DetalleCompra> getDetalleCompraById(Long id) {
        return detalleCompraRepository.findById(id);
    }
    
    public DetalleCompra createDetalleCompra(DetalleCompra detalleCompra) {
        return detalleCompraRepository.save(detalleCompra);
    }
    
    public DetalleCompra updateDetalleCompra(Long id, DetalleCompra detalleCompra) {
        if (detalleCompraRepository.existsById(id)) {
            detalleCompra.setId(id);
            return detalleCompraRepository.save(detalleCompra);
        }
        return null;
    }
    
    public boolean deleteDetalleCompra(Long id) {
        if (detalleCompraRepository.existsById(id)) {
            detalleCompraRepository.deleteById(id);
            return true;
        }
        return false;
    }
}