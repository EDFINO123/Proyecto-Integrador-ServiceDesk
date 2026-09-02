package com.example.demo.controller;

import com.example.demo.dto.AuthResponseDto;
import com.example.demo.dto.PerfilRequestDto;
import com.example.demo.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/perfil")
@CrossOrigin(origins = "http://localhost:4200")
public class PerfilController {

    private final UsuarioService usuarioService;

    public PerfilController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PatchMapping
    public ResponseEntity<AuthResponseDto> actualizarPerfil(@RequestBody PerfilRequestDto request,
                                                            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(usuarioService.actualizarPerfil(userDetails.getUsername(), request));
    }
}
