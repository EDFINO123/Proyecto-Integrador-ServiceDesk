package com.example.demo.repository;

import com.example.demo.model.entity.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

    List<Comentario> findByTicketIdOrderByFechaCreacionAsc(Long ticketId);
}
