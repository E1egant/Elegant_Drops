package com.example.elegant_drops.repository;

import com.example.elegant_drops.model.Fragancia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FraganciasRepository extends JpaRepository<Fragancia, Long> {
}