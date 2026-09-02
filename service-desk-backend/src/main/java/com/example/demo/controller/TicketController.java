package com.example.demo.controller;

import com.example.demo.dto.AsignarRequestDto;
import com.example.demo.dto.CalificacionRequestDto;
import com.example.demo.dto.ComentarioRequestDto;
import com.example.demo.dto.SolucionRequestDto;
import com.example.demo.model.entity.Comentario;
import com.example.demo.model.entity.Ticket;
import com.example.demo.model.enums.EstadoTicket;
import com.example.demo.service.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:4200")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Ticket>> obtenerTodos() {
        return ResponseEntity.ok(ticketService.obtenerTodos());
    }

    @GetMapping("/mis")
    public ResponseEntity<List<Ticket>> obtenerMisTickets(Authentication authentication) {
        return ResponseEntity.ok(ticketService.obtenerPorEmail(authentication.getName()));
    }

    @GetMapping("/asignados")
    @PreAuthorize("hasAnyRole('TECNICO', 'ADMIN')")
    public ResponseEntity<List<Ticket>> obtenerAsignados(Authentication authentication) {
        return ResponseEntity.ok(ticketService.obtenerAsignados(authentication.getName()));
    }

    @GetMapping("/pendientes")
    @PreAuthorize("hasAnyRole('TECNICO', 'ADMIN')")
    public ResponseEntity<List<Ticket>> obtenerPendientes() {
        return ResponseEntity.ok(ticketService.obtenerPendientes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> obtenerPorId(@PathVariable Long id,
                                               Authentication authentication) {
        boolean esAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(
                ticketService.obtenerPorIdAutorizado(id, authentication.getName(), esAdmin));
    }

    @PostMapping
    public ResponseEntity<Ticket> crearTicket(@RequestBody Ticket ticket,
                                              Authentication authentication) {
        if (ticket.getUsuarioEmail() == null || ticket.getUsuarioEmail().isBlank()) {
            ticket.setUsuarioEmail(authentication.getName());
        }
        Ticket creado = ticketService.crearTicket(ticket);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PostMapping("/{id}/tomar")
    @PreAuthorize("hasAnyRole('TECNICO', 'ADMIN')")
    public ResponseEntity<Ticket> tomarTicket(@PathVariable Long id,
                                              Authentication authentication) {
        return ResponseEntity.ok(ticketService.tomarTicket(id, authentication.getName()));
    }

    @PatchMapping("/{id}/asignar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ticket> asignarTicket(@PathVariable Long id,
                                                @RequestBody AsignarRequestDto dto) {
        return ResponseEntity.ok(ticketService.asignarTicket(id, dto.getTecnicoEmail()));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('TECNICO', 'ADMIN')")
    public ResponseEntity<Ticket> actualizarEstado(@PathVariable Long id,
                                                   @RequestParam EstadoTicket estado) {
        return ResponseEntity.ok(ticketService.actualizarEstado(id, estado));
    }

    @PatchMapping("/{id}/solucion")
    @PreAuthorize("hasAnyRole('TECNICO', 'ADMIN')")
    public ResponseEntity<Ticket> actualizarSolucion(@PathVariable Long id,
                                                     @RequestBody SolucionRequestDto dto) {
        return ResponseEntity.ok(ticketService.actualizarSolucion(id, dto.getSolucion()));
    }

    @GetMapping("/{id}/comentarios")
    public ResponseEntity<List<Comentario>> obtenerComentarios(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.obtenerComentarios(id));
    }

    @PostMapping("/{id}/comentarios")
    public ResponseEntity<Comentario> crearComentario(@PathVariable Long id,
                                                      @RequestBody ComentarioRequestDto dto,
                                                      Authentication authentication) {
        Comentario creado = ticketService.crearComentario(id, authentication.getName(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PatchMapping("/{id}/calificar")
    public ResponseEntity<Ticket> calificarTicket(@PathVariable Long id,
                                                  @RequestBody CalificacionRequestDto dto,
                                                  Authentication authentication) {
        return ResponseEntity.ok(
                ticketService.calificarTicket(id, dto.getCalificacion(), authentication.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminarTicket(@PathVariable Long id) {
        ticketService.eliminarTicket(id);
        return ResponseEntity.noContent().build();
    }
}
