package com.inventario.inventory.controller;

import com.inventario.inventory.model.Laboratorio;
import com.inventario.inventory.service.LaboratorioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/laboratorios")
@CrossOrigin(origins = "*")
public class LaboratorioController {
    
    @Autowired
    private LaboratorioService laboratorioService;
    
    @GetMapping
    public ResponseEntity<List<Laboratorio>> getAllLaboratorios() {
        List<Laboratorio> laboratorios = laboratorioService.getAllLaboratorios();
        return new ResponseEntity<>(laboratorios, HttpStatus.OK);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Laboratorio> getLaboratorioById(@PathVariable Long id) {
        Optional<Laboratorio> laboratorio = laboratorioService.getLaboratorioById(id);
        return laboratorio.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @PostMapping
    public ResponseEntity<Laboratorio> createLaboratorio(@RequestBody Laboratorio laboratorio) {
        Laboratorio createdLaboratorio = laboratorioService.createLaboratorio(laboratorio);
        return new ResponseEntity<>(createdLaboratorio, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Laboratorio> updateLaboratorio(@PathVariable Long id, @RequestBody Laboratorio laboratorio) {
        Laboratorio updatedLaboratorio = laboratorioService.updateLaboratorio(id, laboratorio);
        if (updatedLaboratorio != null) {
            return new ResponseEntity<>(updatedLaboratorio, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLaboratorio(@PathVariable Long id) {
        boolean deleted = laboratorioService.deleteLaboratorio(id);
        if (deleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}