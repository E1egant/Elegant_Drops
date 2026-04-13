package com.example.elegant_drops.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "fragancias")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Fragancia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String marca;
    private String concentracion;
    private String genero;
    private String tipo;
    private String imagen;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    private Boolean disponible;

    @OneToMany(mappedBy = "fragancia", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Formato> formatos = new ArrayList<>();
}