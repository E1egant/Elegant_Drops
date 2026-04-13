package com.example.elegant_drops.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "formatos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Formato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer ml;
    private Integer precio;
    private Integer stock;

    @ManyToOne
    @JoinColumn(name = "fragancia_id")
    private Fragancia fragancia;
}