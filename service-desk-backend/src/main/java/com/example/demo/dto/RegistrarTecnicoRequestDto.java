package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrarTecnicoRequestDto {

    private String nombre;
    private String email;
    private String password;
    private String especialidad;
}
