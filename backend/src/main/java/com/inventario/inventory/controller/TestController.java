package com.inventario.inventory.controller;

import com.inventario.inventory.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping("/conexion")
    public ResponseEntity<String> testConexion() {
        try {
            // Intentar obtener el conteo de usuarios para verificar la conexión
            long count = usuarioService.getAllUsuarios().size();
            return ResponseEntity.ok("Conexión a la base de datos funcionando. Usuarios existentes: " + count);
        } catch (Exception e) {
            System.err.println("Error en la conexión a la base de datos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error en la conexión a la base de datos: " + e.getMessage());
        }
    }
}