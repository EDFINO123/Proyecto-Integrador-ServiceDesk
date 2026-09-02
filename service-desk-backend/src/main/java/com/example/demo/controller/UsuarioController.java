package com.example.demo.controller;

import com.example.demo.dto.TecnicoDto;
import com.example.demo.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:4200")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/tecnicos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TecnicoDto>> obtenerTecnicos() {
        return ResponseEntity.ok(usuarioService.obtenerTecnicos());
    }
}
