package com.example.elegant_drops.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "resenas")
public class Resena {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private Integer calificacion;

    @Column(columnDefinition = "TEXT")
    private String comentario;

    private LocalDateTime fecha;

    @Column(name = "codigo_transaccion")
    private String codigoTransaccion;
}