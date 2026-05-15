package com.example.elegant_drops.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    // Rutas que maneja React
    @GetMapping(value = {
            "/",
            "/decants",
            "/completos",
            "/packs",
            "/checkout",
            "/confirmacion",
            "/error-pago",
            "/pendiente"
    })
    public String spa() {
        return "forward:/index.html";
    }
}