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
public class RegisterRequestDto {

    private String nombre;
    private String email;
    private String password;
    private Rol rol;
}
