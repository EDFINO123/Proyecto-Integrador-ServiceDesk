package com.example.demo.service;

import com.example.demo.config.JwtUtils;
import com.example.demo.dto.AuthResponseDto;
import com.example.demo.dto.PerfilRequestDto;
import com.example.demo.dto.RegisterRequestDto;
import com.example.demo.dto.RegistrarTecnicoRequestDto;
import com.example.demo.dto.TecnicoDto;
import com.example.demo.dto.UsuarioAdminDto;
import com.example.demo.model.entity.Usuario;
import com.example.demo.model.enums.Rol;
import com.example.demo.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtils jwtUtils) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = obtenerPorEmail(email);

        return new User(
                usuario.getEmail(),
                usuario.getPassword(),
                List.of(new SimpleGrantedAuthority(usuario.getRol().name()))
        );
    }

    public Usuario obtenerPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));
    }

    public AuthResponseDto registrar(RegisterRequestDto dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya está registrado");
        }

        Usuario usuario = Usuario.builder()
                .nombre(dto.getNombre())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .rol(Rol.ROLE_USUARIO)
                .build();

        usuarioRepository.save(usuario);

        return buildAuthResponse(usuario);
    }

    public AuthResponseDto crearUsuario(RegisterRequestDto dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya está registrado");
        }

        Rol rol = dto.getRol() != null ? dto.getRol() : Rol.ROLE_USUARIO;

        Usuario usuario = Usuario.builder()
                .nombre(dto.getNombre())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .rol(rol)
                .build();

        usuarioRepository.save(usuario);

        return buildAuthResponse(usuario);
    }

    public AuthResponseDto buildAuthResponse(Usuario usuario) {
        String token = jwtUtils.generateToken(usuario.getEmail(), usuario.getRol().name());

        return AuthResponseDto.builder()
                .token(token)
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .rol(usuario.getRol())
                .telefono(usuario.getTelefono())
                .avatarUrl(usuario.getAvatarUrl())
                .build();
    }

    public AuthResponseDto actualizarPerfil(String email, PerfilRequestDto dto) {
        Usuario usuario = obtenerPorEmail(email);

        if (dto.getNombre() == null || dto.getNombre().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre no puede estar vacío");
        }

        usuario.setNombre(dto.getNombre());
        usuario.setTelefono(dto.getTelefono());
        usuario.setAvatarUrl(dto.getAvatarUrl());

        usuarioRepository.save(usuario);

        return buildAuthResponse(usuario);
    }

    public List<TecnicoDto> obtenerTecnicos() {
        return usuarioRepository.findByRol(Rol.ROLE_TECNICO).stream()
                .map(u -> TecnicoDto.builder()
                        .email(u.getEmail())
                        .nombre(u.getNombre())
                        .avatarUrl(u.getAvatarUrl())
                        .build())
                .toList();
    }

    public AuthResponseDto registrarTecnico(RegistrarTecnicoRequestDto dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya está registrado");
        }

        String password = dto.getPassword() != null && !dto.getPassword().isBlank()
                ? dto.getPassword()
                : "Tecnico123!";

        Usuario tecnico = Usuario.builder()
                .nombre(dto.getNombre())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(password))
                .rol(Rol.ROLE_TECNICO)
                .especialidad(dto.getEspecialidad())
                .activo(true)
                .build();

        usuarioRepository.save(tecnico);

        return buildAuthResponse(tecnico);
    }

    public List<UsuarioAdminDto> obtenerUsuariosAdmin() {
        return usuarioRepository.findAll().stream()
                .map(u -> UsuarioAdminDto.builder()
                        .id(u.getId())
                        .nombre(u.getNombre())
                        .email(u.getEmail())
                        .rol(u.getRol())
                        .activo(u.getActivo() == null || u.getActivo())
                        .especialidad(u.getEspecialidad())
                        .telefono(u.getTelefono())
                        .avatarUrl(u.getAvatarUrl())
                        .build())
                .toList();
    }

    public void eliminarUsuario(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado");
        }
        usuarioRepository.deleteById(id);
    }
}
