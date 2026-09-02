package com.example.demo.dto;

import com.example.demo.model.enums.Rol;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioAdminDto {

    private Long id;
    private String nombre;
    private String email;
    private Rol rol;
    private Boolean activo;
    private String especialidad;
    private String telefono;
    private String avatarUrl;
}
