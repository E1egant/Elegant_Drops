package com.example.elegant_drops.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "external_reference", unique = true)
    private String externalReference;

    private String nombre;
    private String apellido;
    private String rut;
    private String telefono;
    private String correo;

    @Column(name = "tipo_entrega")
    private String tipoEntrega;

    private String direccion;
    private String estacion;

    @Column(name = "resumen_pedido", columnDefinition = "TEXT")
    private String resumenPedido;

    private String total;

    @Column(name = "items_json", columnDefinition = "TEXT")
    private String itemsJson;

    private String estado;
    private LocalDateTime fecha;
}