package com.example.elegant_drops.repository;

import com.example.elegant_drops.model.PackItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PackItemRepository extends JpaRepository<PackItem, Long> {
    void deleteByPackId(Long packId);
}