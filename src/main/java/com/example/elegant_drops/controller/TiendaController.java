package com.example.elegant_drops.controller;

import com.example.elegant_drops.model.CategoriaFragancia;
import com.example.elegant_drops.model.Fragancia;
import com.example.elegant_drops.repository.PackRepository;
import com.example.elegant_drops.repository.ResenaRepository;
import com.example.elegant_drops.service.FraganciasService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tienda")
public class TiendaController {

    @Autowired private FraganciasService fraganciaService;
    @Autowired private PackRepository packRepository;
    @Autowired private ResenaRepository resenaRepository;

    @GetMapping("/decants")
    public ResponseEntity<?> decants(@RequestParam(required = false) String filtro) {
        List<Fragancia> fragancias = fraganciaService.listarTodas().stream()
                .filter(f -> f.getDisponible() != null && f.getDisponible())
                .filter(f -> f.getCategoria() == null || f.getCategoria().equals(CategoriaFragancia.DECANT))
                .sorted(Comparator.comparingInt(f -> f.getOrden() != null ? f.getOrden() : 999))
                .peek(f -> f.getFormatos().sort(Comparator.comparingInt(fmt -> fmt.getMl())))
                .collect(Collectors.toList());

        if (filtro != null && !filtro.isEmpty() && !filtro.equals("todos")) {
            fragancias = fragancias.stream()
                    .filter(f -> filtro.equalsIgnoreCase(f.getTipo()) || filtro.equalsIgnoreCase(f.getGenero()))
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(fragancias);
    }

    @GetMapping("/completos")
    public ResponseEntity<?> completos(@RequestParam(required = false) String filtro) {
        List<Fragancia> fragancias = fraganciaService.listarTodas().stream()
                .filter(f -> f.getDisponible() != null && f.getDisponible())
                .filter(f -> f.getCategoria() != null && f.getCategoria().equals(CategoriaFragancia.COMPLETO))
                .sorted(Comparator.comparingInt(f -> f.getOrden() != null ? f.getOrden() : 999))
                .peek(f -> f.getFormatos().sort(Comparator.comparingInt(fmt -> fmt.getMl())))
                .collect(Collectors.toList());

        if (filtro != null && !filtro.isEmpty() && !filtro.equals("todos")) {
            fragancias = fragancias.stream()
                    .filter(f -> filtro.equalsIgnoreCase(f.getTipo()) || filtro.equalsIgnoreCase(f.getGenero()))
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(fragancias);
    }

    @GetMapping("/packs")
    public ResponseEntity<?> packs() {
        return ResponseEntity.ok(packRepository.findByDisponibleTrueOrderByOrdenAsc());
    }

    @GetMapping("/resenas")
    public ResponseEntity<?> resenas() {
        return ResponseEntity.ok(resenaRepository.findAllByOrderByFechaDesc());
    }

    @GetMapping("/buscar")
    public ResponseEntity<?> buscar(@RequestParam String q) {
        if (q == null || q.trim().length() < 2) return ResponseEntity.ok(List.of());

        String query = q.trim().toLowerCase();
        List<Fragancia> resultados = fraganciaService.listarTodas().stream()
                .filter(f -> f.getDisponible() != null && f.getDisponible())
                .filter(f ->
                        (f.getNombre() != null && f.getNombre().toLowerCase().contains(query)) ||
                                (f.getMarca() != null && f.getMarca().toLowerCase().contains(query)) ||
                                (f.getDescripcion() != null && f.getDescripcion().toLowerCase().contains(query))
                )
                .sorted(Comparator.comparingInt(f -> f.getOrden() != null ? f.getOrden() : 999))
                .peek(f -> f.getFormatos().sort(Comparator.comparingInt(fmt -> fmt.getMl())))
                .collect(Collectors.toList());

        return ResponseEntity.ok(resultados);
    }
}