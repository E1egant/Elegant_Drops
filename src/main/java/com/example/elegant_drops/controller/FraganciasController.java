package com.example.elegant_drops.controller;

import com.example.elegant_drops.model.Fragancia;
import com.example.elegant_drops.model.Resena;
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

    @Autowired
    private FraganciasService fraganciaService;

    @Autowired
    private ResenaRepository resenaRepository;

    @GetMapping("/")
    public String index(Model model, @RequestParam(required = false) String filtro,
                        @RequestParam(required = false) String resena) {
        List<Fragancia> todasLasFragancias = fraganciaService.listarTodas();

        List<Fragancia> fraganciasDisponibles = todasLasFragancias.stream()
                .filter(f -> f.getDisponible() != null && f.getDisponible())
                .sorted(Comparator.comparingInt(f -> f.getOrden() != null ? f.getOrden() : 999))
                .peek(f -> f.getFormatos().sort(Comparator.comparingInt(formato -> formato.getMl())))
                .collect(Collectors.toList());

        if (filtro != null && !filtro.isEmpty() && !filtro.equals("todos")) {
            fraganciasDisponibles = fraganciasDisponibles.stream()
                    .filter(f -> filtro.equalsIgnoreCase(f.getTipo()) || filtro.equalsIgnoreCase(f.getGenero()))
                    .collect(Collectors.toList());
        }

        List<Resena> resenas = resenaRepository.findAllByOrderByFechaDesc();

        model.addAttribute("fragancias", fraganciasDisponibles);
        model.addAttribute("filtroActivo", filtro != null ? filtro : "todos");
        model.addAttribute("resenas", resenas);
        model.addAttribute("resenaOk", "ok".equals(resena));
        return "admin/index";
    }
}