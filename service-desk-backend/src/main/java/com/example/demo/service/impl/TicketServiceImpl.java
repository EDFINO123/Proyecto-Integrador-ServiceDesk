package com.example.demo.service.impl;

import com.example.demo.dto.ComentarioRequestDto;
import com.example.demo.model.entity.Comentario;
import com.example.demo.model.entity.Ticket;
import com.example.demo.model.entity.Usuario;
import com.example.demo.model.enums.EstadoTicket;
import com.example.demo.model.enums.Rol;
import com.example.demo.repository.ComentarioRepository;
import com.example.demo.repository.TicketRepository;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.service.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UsuarioRepository usuarioRepository;
    private final ComentarioRepository comentarioRepository;

    private static final Map<EstadoTicket, Set<EstadoTicket>> TRANSICIONES = Map.of(
            EstadoTicket.ABIERTO, Set.of(EstadoTicket.EN_PROCESO, EstadoTicket.CERRADO),
            EstadoTicket.EN_PROCESO, Set.of(EstadoTicket.RESUELTO, EstadoTicket.CERRADO),
            EstadoTicket.RESUELTO, Set.of(EstadoTicket.CERRADO),
            EstadoTicket.CERRADO, Set.of()
    );

    public TicketServiceImpl(TicketRepository ticketRepository,
                             UsuarioRepository usuarioRepository,
                             ComentarioRepository comentarioRepository) {
        this.ticketRepository = ticketRepository;
        this.usuarioRepository = usuarioRepository;
        this.comentarioRepository = comentarioRepository;
    }

    @Override
    public List<Ticket> obtenerTodos() {
        return enriquecer(ticketRepository.findAll());
    }

    @Override
    public List<Ticket> obtenerPorEmail(String email) {
        return enriquecer(ticketRepository.findByUsuarioEmailOrderByFechaCreacionDesc(email));
    }

    @Override
    public List<Ticket> obtenerAsignados(String email) {
        return enriquecer(ticketRepository.findByTecnicoEmailOrderByFechaCreacionDesc(email));
    }

    @Override
    public List<Ticket> obtenerPendientes() {
        return enriquecer(ticketRepository.findByTecnicoEmailIsNullOrderByFechaCreacionDesc());
    }

    @Override
    public Ticket obtenerPorId(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado con id: " + id));
        return enriquecer(ticket);
    }

    @Override
    public Ticket obtenerPorIdAutorizado(Long id, String email, boolean esAdmin) {
        Ticket ticket = obtenerPorId(id);

        boolean esSolicitante = email.equals(ticket.getUsuarioEmail());
        boolean esTecnicoAsignado = email.equals(ticket.getTecnicoEmail());
        if (!esAdmin && !esSolicitante && !esTecnicoAsignado) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para ver este ticket");
        }
        return ticket;
    }

    @Override
    public Ticket crearTicket(Ticket ticket) {
        return enriquecer(ticketRepository.save(ticket));
    }

    @Override
    public Ticket tomarTicket(Long id, String tecnicoEmail) {
        Ticket ticket = obtenerPorId(id);
        ticket.setTecnicoEmail(tecnicoEmail);
        return enriquecer(ticketRepository.save(ticket));
    }

    @Override
    public Ticket asignarTicket(Long id, String tecnicoEmail) {
        Usuario tecnico = usuarioRepository.findByEmail(tecnicoEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Técnico no encontrado"));
        if (tecnico.getRol() != Rol.ROLE_TECNICO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El usuario no tiene rol de técnico");
        }

        Ticket ticket = obtenerPorId(id);
        ticket.setTecnicoEmail(tecnicoEmail);
        return enriquecer(ticketRepository.save(ticket));
    }

    @Override
    public Ticket actualizarEstado(Long id, EstadoTicket estado) {
        Ticket ticket = obtenerPorId(id);
        validarTransicion(ticket, estado);
        ticket.setEstado(estado);
        return enriquecer(ticketRepository.save(ticket));
    }

    @Override
    public Ticket actualizarSolucion(Long id, String solucion) {
        Ticket ticket = obtenerPorId(id);
        ticket.setSolucion(solucion);
        return enriquecer(ticketRepository.save(ticket));
    }

    @Override
    public Ticket calificarTicket(Long id, int calificacion, String autorEmail) {
        Ticket ticket = obtenerPorId(id);

        if (ticket.getCalificacion() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El ticket ya fue calificado");
        }
        if (ticket.getEstado() != EstadoTicket.RESUELTO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El ticket debe estar RESUELTO para calificar");
        }
        if (ticket.getUsuarioEmail() == null || !ticket.getUsuarioEmail().equals(autorEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo el solicitante puede calificar este ticket");
        }

        int nota = Math.max(1, Math.min(5, calificacion));
        ticket.setCalificacion(nota);
        ticket.setEstado(EstadoTicket.CERRADO);

        return enriquecer(ticketRepository.save(ticket));
    }

    @Override
    public List<Comentario> obtenerComentarios(Long ticketId) {
        obtenerPorId(ticketId);
        return comentarioRepository.findByTicketIdOrderByFechaCreacionAsc(ticketId);
    }

    @Override
    public Comentario crearComentario(Long ticketId, String autorEmail, ComentarioRequestDto dto) {
        Ticket ticket = obtenerPorId(ticketId);

        if (dto.getMensaje() == null || dto.getMensaje().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El mensaje no puede estar vacío");
        }

        Usuario autor = usuarioRepository.findByEmail(autorEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        boolean esAdmin = autor.getRol() == Rol.ROLE_ADMIN;
        boolean esParticipante = autorEmail.equals(ticket.getUsuarioEmail())
                || autorEmail.equals(ticket.getTecnicoEmail());
        if (!esAdmin && !esParticipante) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes comentar en este ticket");
        }

        Comentario comentario = Comentario.builder()
                .ticketId(ticketId)
                .autorEmail(autorEmail)
                .autorNombre(autor.getNombre())
                .autorAvatar(autor.getAvatarUrl())
                .mensaje(dto.getMensaje())
                .build();

        return comentarioRepository.save(comentario);
    }

    @Override
    public void eliminarTicket(Long id) {
        if (!ticketRepository.existsById(id)) {
            throw new RuntimeException("Ticket no encontrado con id: " + id);
        }
        ticketRepository.deleteById(id);
    }

    private void validarTransicion(Ticket ticket, EstadoTicket nuevo) {
        EstadoTicket actual = ticket.getEstado();
        if (nuevo == actual) {
            return;
        }
        Set<EstadoTicket> permitidos = TRANSICIONES.getOrDefault(actual, Set.of());
        if (!permitidos.contains(nuevo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Transición de estado inválida: " + actual + " -> " + nuevo);
        }
        if (nuevo == EstadoTicket.RESUELTO
                && (ticket.getSolucion() == null || ticket.getSolucion().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No se puede marcar RESUELTO sin registrar una solución");
        }
    }

    private List<Ticket> enriquecer(List<Ticket> tickets) {
        tickets.forEach(this::enriquecer);
        return tickets;
    }

    private Ticket enriquecer(Ticket ticket) {
        if (ticket.getUsuarioEmail() != null) {
            usuarioRepository.findByEmail(ticket.getUsuarioEmail()).ifPresent(usuario -> {
                ticket.setUsuarioNombre(usuario.getNombre());
                ticket.setUsuarioAvatar(usuario.getAvatarUrl());
            });
        }
        if (ticket.getTecnicoEmail() != null) {
            usuarioRepository.findByEmail(ticket.getTecnicoEmail()).ifPresent(tecnico -> {
                ticket.setTecnicoNombre(tecnico.getNombre());
                ticket.setTecnicoAvatar(tecnico.getAvatarUrl());
            });
        }
        return ticket;
    }
}
