// src/main/java/com/dasha/inventory/service/UsuarioService.java

package com.inventario.inventory.service;

import com.inventario.inventory.model.Usuario;
import com.inventario.inventory.model.Role;
import com.inventario.inventory.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // ==================== PARA LOGIN (OBLIGATORIO) ====================
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));
    }

    // ==================== BUSCAR POR EMAIL ====================
    public Optional<Usuario> findByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    // ==================== REGISTRAR USUARIO (desde Auth o formulario) ====================
    public Usuario save(Usuario usuario) {
        if (usuario.getPassword() != null && !usuario.getPassword().isEmpty()) {
            // No encrypt password - plain text
        }
        if (usuario.getRol() == null) {
            usuario.setRol(Role.TECNICO); // por defecto
        }
        return usuarioRepository.save(usuario);
    }

    // ==================== CRUD COMPLETO ====================
    public List<Usuario> getAllUsuarios() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> getUsuarioById(Long id) {
        return usuarioRepository.findById(id);
    }

    public Usuario createUsuario(Usuario usuario) {
        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            throw new RuntimeException("El email ya está registrado");
        }
        if (usuario.getPassword() == null || usuario.getPassword().isEmpty()) {
            throw new RuntimeException("La contraseña es obligatoria");
        }
        // No encrypt password - plain text
        if (usuario.getRol() == null) {
            usuario.setRol(Role.TECNICO);
        }
        return usuarioRepository.save(usuario);
    }

    public Usuario updateUsuario(Long id, Usuario usuarioDetails) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    usuario.setNombre(usuarioDetails.getNombre());
                    usuario.setEmail(usuarioDetails.getEmail());
                    if (usuarioDetails.getRol() != null) {
                        usuario.setRol(usuarioDetails.getRol());
                    }
                    // No actualizamos contraseña aquí por seguridad
                    return usuarioRepository.save(usuario);
                })
                .orElse(null);
    }

    public boolean deleteUsuario(Long id) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    usuarioRepository.delete(usuario);
                    return true;
                })
                .orElse(false);
    }
}