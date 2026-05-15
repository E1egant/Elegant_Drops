package com.example.elegant_drops.controller;

import com.example.elegant_drops.model.CategoriaFragancia;
import com.example.elegant_drops.model.Fragancia;
import com.example.elegant_drops.model.Resena;
import com.example.elegant_drops.repository.PackRepository;
import com.example.elegant_drops.repository.ResenaRepository;
import com.example.elegant_drops.service.FraganciasService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Controller
public class FraganciasController {

    @Autowired private FraganciasService fraganciaService;
    @Autowired private ResenaRepository resenaRepository;
    @Autowired private PackRepository packRepository;

    @GetMapping("/")
    public String index(Model model,
                        @RequestParam(required = false) String filtro,
                        @RequestParam(required = false) String resena) {

        List<Fragancia> todas = fraganciaService.listarTodas().stream()
                .filter(f -> f.getDisponible() != null && f.getDisponible())
                .sorted(Comparator.comparingInt(f -> f.getOrden() != null ? f.getOrden() : 999))
                .peek(f -> f.getFormatos().sort(Comparator.comparingInt(fmt -> fmt.getMl())))
                .collect(Collectors.toList());

        List<Fragancia> decants = todas.stream()
                .filter(f -> f.getCategoria() == null || f.getCategoria().equals(CategoriaFragancia.DECANT))
                .collect(Collectors.toList());

        List<Fragancia> completos = todas.stream()
                .filter(f -> f.getCategoria() != null && f.getCategoria().equals(CategoriaFragancia.COMPLETO))
                .collect(Collectors.toList());

        if (filtro != null && !filtro.isEmpty() && !filtro.equals("todos")) {
            decants = decants.stream()
                    .filter(f -> filtro.equalsIgnoreCase(f.getTipo()) || filtro.equalsIgnoreCase(f.getGenero()))
                    .collect(Collectors.toList());
            completos = completos.stream()
                    .filter(f -> filtro.equalsIgnoreCase(f.getTipo()) || filtro.equalsIgnoreCase(f.getGenero()))
                    .collect(Collectors.toList());
        }

        List<Resena> resenas = resenaRepository.findAllByOrderByFechaDesc();

        model.addAttribute("decants", decants);
        model.addAttribute("completos", completos);
        model.addAttribute("packs", packRepository.findByDisponibleTrueOrderByOrdenAsc());
        model.addAttribute("filtroActivo", filtro != null ? filtro : "todos");
        model.addAttribute("resenas", resenas);
        model.addAttribute("resenaOk", "ok".equals(resena));
        return "admin/index";
    }
}