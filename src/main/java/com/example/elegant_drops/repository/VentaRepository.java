package com.example.elegant_drops.repository;

import com.example.elegant_drops.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {

    List<Venta> findAllByOrderByFechaDesc();

    @Query("SELECT COALESCE(SUM(v.total), 0) FROM Venta v WHERE WEEK(v.fecha) = WEEK(CURRENT_DATE) AND YEAR(v.fecha) = YEAR(CURRENT_DATE)")
    Integer gananciasSemana();

    @Query("SELECT COALESCE(SUM(v.total), 0) FROM Venta v WHERE MONTH(v.fecha) = MONTH(CURRENT_DATE) AND YEAR(v.fecha) = YEAR(CURRENT_DATE)")
    Integer gananciasMes();

    @Query("SELECT COALESCE(SUM(v.total), 0) FROM Venta v WHERE YEAR(v.fecha) = YEAR(CURRENT_DATE)")
    Integer gananciasAnio();
}