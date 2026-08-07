package com.inventario.inventory.service;

import com.inventario.inventory.model.Compra;
import com.inventario.inventory.repository.CompraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CompraService {
    
    @Autowired
    private CompraRepository compraRepository;
    
    public List<Compra> getAllCompras() {
        return compraRepository.findAll();
    }
    
    public Optional<Compra> getCompraById(Long id) {
        return compraRepository.findById(id);
    }
    
    public Compra createCompra(Compra compra) {
        return compraRepository.save(compra);
    }
    
    public Compra updateCompra(Long id, Compra compra) {
        if (compraRepository.existsById(id)) {
            compra.setId(id);
            return compraRepository.save(compra);
        }
        return null;
    }
    
    public boolean deleteCompra(Long id) {
        if (compraRepository.existsById(id)) {
            compraRepository.deleteById(id);
            return true;
        }
        return false;
    }
}