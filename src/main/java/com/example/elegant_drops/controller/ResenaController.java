package com.example.elegant_drops.controller;

import com.example.elegant_drops.model.Resena;
import com.example.elegant_drops.repository.ResenaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@Controller
public class ResenaController {

    @Autowired
    private ResenaRepository resenaRepository;

    @PostMapping("/resena/guardar")
    public String guardar(
            @RequestParam String nombre,
            @RequestParam Integer calificacion,
            @RequestParam String comentario,
            @RequestParam String codigoTransaccion) {

        if (!resenaRepository.existsByCodigoTransaccion(codigoTransaccion)) {
            Resena resena = new Resena();
            resena.setNombre(nombre);
            resena.setCalificacion(calificacion);
            resena.setComentario(comentario);
            resena.setFecha(LocalDateTime.now());
            resena.setCodigoTransaccion(codigoTransaccion);
            resenaRepository.save(resena);
        }

        return "redirect:/?resena=ok";
    }
}