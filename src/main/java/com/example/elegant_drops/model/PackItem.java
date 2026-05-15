package com.example.elegant_drops.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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

    @JsonBackReference("pack-items")
    @ManyToOne
    @JoinColumn(name = "pack_id")
    private Pack pack;

    @JsonIgnoreProperties("formatos")
    @ManyToOne
    @JoinColumn(name = "fragancia_id")
    private Fragancia fragancia;

    private Integer ml;
    private Integer cantidad;
}