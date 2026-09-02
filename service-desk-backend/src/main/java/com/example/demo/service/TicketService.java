package com.example.demo.service;

import com.example.demo.dto.ComentarioRequestDto;
import com.example.demo.model.entity.Comentario;
import com.example.demo.model.entity.Ticket;
import com.example.demo.model.enums.EstadoTicket;

import java.util.List;

public interface TicketService {

    List<Ticket> obtenerTodos();

    List<Ticket> obtenerPorEmail(String email);

    List<Ticket> obtenerAsignados(String email);

    List<Ticket> obtenerPendientes();

    Ticket obtenerPorId(Long id);

    Ticket obtenerPorIdAutorizado(Long id, String email, boolean esAdmin);

    Ticket crearTicket(Ticket ticket);

    Ticket tomarTicket(Long id, String tecnicoEmail);

    Ticket asignarTicket(Long id, String tecnicoEmail);

    Ticket actualizarEstado(Long id, EstadoTicket estado);

    Ticket actualizarSolucion(Long id, String solucion);

    Ticket calificarTicket(Long id, int calificacion, String autorEmail);

    List<Comentario> obtenerComentarios(Long ticketId);

    Comentario crearComentario(Long ticketId, String autorEmail, ComentarioRequestDto dto);

    void eliminarTicket(Long id);
}
