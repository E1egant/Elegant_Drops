package com.example.elegant_drops.controller;

import com.example.elegant_drops.model.Resena;
import com.example.elegant_drops.repository.ResenaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@Controller
public class ResenaController {

    @Autowired private ResenaRepository resenaRepository;

    @PostMapping("/api/resena/guardar")
    @ResponseBody
    public ResponseEntity<?> guardar(
            @RequestParam String nombre,
            @RequestParam Integer calificacion,
            @RequestParam String comentario) {

        Resena resena = new Resena();
        resena.setNombre(nombre);
        resena.setCalificacion(calificacion);
        resena.setComentario(comentario);
        resena.setFecha(LocalDateTime.now());
        resenaRepository.save(resena);
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
