package com.example.demo.repository;

import com.example.demo.model.entity.Ticket;
import com.example.demo.model.enums.EstadoTicket;
import com.example.demo.model.enums.PrioridadTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByEstado(EstadoTicket estado);

    List<Ticket> findByPrioridad(PrioridadTicket prioridad);

    List<Ticket> findByUsuarioEmailOrderByFechaCreacionDesc(String email);

    List<Ticket> findByTecnicoEmailOrderByFechaCreacionDesc(String email);

    List<Ticket> findByTecnicoEmailIsNullOrderByFechaCreacionDesc();
}
