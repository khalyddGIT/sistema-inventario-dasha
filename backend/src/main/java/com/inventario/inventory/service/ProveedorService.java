package com.inventario.inventory.service;

import com.inventario.inventory.model.Proveedor;
import com.inventario.inventory.repository.ProveedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProveedorService {
    
    @Autowired
    private ProveedorRepository proveedorRepository;
    
    public List<Proveedor> getAllProveedores() {
        return proveedorRepository.findAll();
    }
    
    public Optional<Proveedor> getProveedorById(Long id) {
        return proveedorRepository.findById(id);
    }
    
    public Proveedor createProveedor(Proveedor proveedor) {
        return proveedorRepository.save(proveedor);
    }
    
    public Proveedor updateProveedor(Long id, Proveedor proveedor) {
        if (proveedorRepository.existsById(id)) {
            proveedor.setId(id);
            return proveedorRepository.save(proveedor);
        }
        return null;
    }
    
    public boolean deleteProveedor(Long id) {
        if (proveedorRepository.existsById(id)) {
            proveedorRepository.deleteById(id);
            return true;
        }
        return false;
    }
}