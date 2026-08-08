package com.inventario.inventory.controller;

import com.inventario.inventory.model.*;
import com.inventario.inventory.dto.*;
import com.inventario.inventory.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/registro")
    public ResponseEntity<Map<String, Object>> registro(@RequestBody RegisterRequest request) {
        try {
            // Validaciones
            if (request.getNombre() == null || request.getNombre().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "El nombre es obligatorio"));
            }
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "El email es obligatorio"));
            }
            if (usuarioService.findByEmail(request.getEmail().trim()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Este email ya está registrado"));
            }
            if (request.getPassword() == null || request.getPassword().length() < 6) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "La contraseña debe tener al menos 6 caracteres"));
            }
            if (request.getRol() == null || !request.getRol().matches("(?i)ADMIN|TECNICO")) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Rol inválido. Usa ADMIN o TECNICO"));
            }

            // Convertir rol y crear usuario
            Role rol = Role.valueOf(request.getRol().trim().toUpperCase());

            Usuario usuario = new Usuario();
            usuario.setNombre(request.getNombre().trim());
            usuario.setEmail(request.getEmail().trim().toLowerCase());
            usuario.setPassword(request.getPassword()); // Plain text - no encryption!
            usuario.setRol(rol);

            Usuario creado = usuarioService.save(usuario);

            return ResponseEntity.status(201).body(Map.of(
                    "success", true,
                    "message", "Usuario registrado exitosamente",
                    "usuario", Map.of(
                            "id", creado.getId(),
                            "nombre", creado.getNombre(),
                            "email", creado.getEmail(),
                            "rol", creado.getRol().name()
                    )
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Error interno del servidor"
            ));
        }
    }

    // LOGIN (corregido)
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest loginRequest) {
        var usuarioOpt = usuarioService.findByEmail(loginRequest.getEmail());

        if (usuarioOpt.isEmpty() || !loginRequest.getPassword().equals(usuarioOpt.get().getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Credenciales inválidas"));
        }

        Usuario usuario = usuarioOpt.get();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Login exitoso",
                "usuario", Map.of(
                        "id", usuario.getId(),
                        "nombre", usuario.getNombre(),
                        "email", usuario.getEmail(),
                        "rol", usuario.getRol().name()
                )
        ));
    }
}