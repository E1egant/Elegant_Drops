package com.example.elegant_drops.repository;

import com.example.elegant_drops.model.Pack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PackRepository extends JpaRepository<Pack, Long> {
    List<Pack> findAllByOrderByOrdenAsc();
    List<Pack> findByDisponibleTrueOrderByOrdenAsc();
}