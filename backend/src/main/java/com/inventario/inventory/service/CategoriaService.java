package com.inventario.inventory.service;

import com.inventario.inventory.model.Categoria;
import com.inventario.inventory.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CategoriaService {
    
    @Autowired
    private CategoriaRepository categoriaRepository;
    
    public List<Categoria> getAllCategorias() {
        return categoriaRepository.findAll();
    }
    
    public Optional<Categoria> getCategoriaById(Long id) {
        return categoriaRepository.findById(id);
    }
    
    public Categoria createCategoria(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }
    
    public Categoria updateCategoria(Long id, Categoria categoria) {
        if (categoriaRepository.existsById(id)) {
            categoria.setId(id);
            return categoriaRepository.save(categoria);
        }
        return null;
    }
    
    public boolean deleteCategoria(Long id) {
        if (categoriaRepository.existsById(id)) {
            categoriaRepository.deleteById(id);
            return true;
        }
        return false;
    }
}