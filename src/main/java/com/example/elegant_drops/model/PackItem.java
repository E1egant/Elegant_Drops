package com.example.elegant_drops.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pack_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PackItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "pack_id")
    private Pack pack;

    @ManyToOne
    @JoinColumn(name = "fragancia_id")
    private Fragancia fragancia;

    private Integer ml;
    private Integer cantidad;
}