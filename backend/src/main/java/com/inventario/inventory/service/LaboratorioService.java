package com.inventario.inventory.service;

import com.inventario.inventory.model.Laboratorio;
import com.inventario.inventory.repository.LaboratorioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class LaboratorioService {
    
    @Autowired
    private LaboratorioRepository laboratorioRepository;
    
    public List<Laboratorio> getAllLaboratorios() {
        return laboratorioRepository.findAll();
    }
    
    public Optional<Laboratorio> getLaboratorioById(Long id) {
        return laboratorioRepository.findById(id);
    }
    
    public Laboratorio createLaboratorio(Laboratorio laboratorio) {
        return laboratorioRepository.save(laboratorio);
    }
    
    public Laboratorio updateLaboratorio(Long id, Laboratorio laboratorio) {
        if (laboratorioRepository.existsById(id)) {
            laboratorio.setId(id);
            return laboratorioRepository.save(laboratorio);
        }
        return null;
    }
    
    public boolean deleteLaboratorio(Long id) {
        if (laboratorioRepository.existsById(id)) {
            laboratorioRepository.deleteById(id);
            return true;
        }
        return false;
    }
}