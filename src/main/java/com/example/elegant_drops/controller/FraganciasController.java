package com.example.elegant_drops.controller;

import com.example.elegant_drops.model.Fragancia;
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

    @GetMapping("/")
    public String index(Model model, @RequestParam(required = false) String filtro) {
        List<Fragancia> todasLasFragancias = fraganciaService.listarTodas();

        List<Fragancia> fraganciasDisponibles = todasLasFragancias.stream()
                .filter(f -> f.getDisponible() != null && f.getDisponible())
                .peek(f -> f.getFormatos().sort(Comparator.comparingInt(formato -> formato.getMl())))
                .collect(Collectors.toList());

        if (filtro != null && !filtro.isEmpty() && !filtro.equals("todos")) {
            fraganciasDisponibles = fraganciasDisponibles.stream()
                    .filter(f -> filtro.equalsIgnoreCase(f.getTipo()) || filtro.equalsIgnoreCase(f.getGenero()))
                    .collect(Collectors.toList());
        }

        model.addAttribute("fragancias", fraganciasDisponibles);
        model.addAttribute("filtroActivo", filtro != null ? filtro : "todos");
        return "admin/index";
    }
}