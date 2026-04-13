package com.example.elegant_drops.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ventas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime fecha;
    private Integer total;
    private String tipoEntrega;
    private String codigoTransaccion;

    @Column(columnDefinition = "TEXT")
    private String detalle;
}