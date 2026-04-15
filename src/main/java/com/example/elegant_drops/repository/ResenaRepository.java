package com.example.elegant_drops.repository;

import com.example.elegant_drops.model.Resena;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResenaRepository extends JpaRepository<Resena, Long> {
    boolean existsByCodigoTransaccion(String codigoTransaccion);
    List<Resena> findAllByOrderByFechaDesc();
}