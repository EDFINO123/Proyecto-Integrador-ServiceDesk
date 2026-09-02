package com.example.demo.model.entity;

import com.example.demo.model.enums.EstadoTicket;
import com.example.demo.model.enums.PrioridadTicket;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(length = 1000)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EstadoTicket estado = EstadoTicket.ABIERTO;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PrioridadTicket prioridad = PrioridadTicket.MEDIA;

    private String usuarioEmail;

    private String tecnicoEmail;

    @Transient
    private String usuarioNombre;

    @Transient
    private String usuarioAvatar;

    @Transient
    private String tecnicoNombre;

    @Transient
    private String tecnicoAvatar;

    @Column(length = 2000)
    private String solucion;

    @Column(length = 1000)
    private String adjuntoUrl;

    private Integer calificacion;

    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaActualizacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}
