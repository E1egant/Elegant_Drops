package com.example.elegant_drops.controller;

import com.example.elegant_drops.model.*;
import com.example.elegant_drops.repository.*;
import com.example.elegant_drops.service.CloudinaryService;
import com.example.elegant_drops.service.FraganciasService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/${admin.path}/api/packs")
public class PackController {

    @Autowired private PackRepository packRepository;
    @Autowired private PackItemRepository packItemRepository;
    @Autowired private FraganciasService fraganciaService;
    @Autowired private CloudinaryService cloudinaryService;
    @Value("${admin.path}") private String adminPath;

    private boolean sinSesion(HttpSession session) {
        return session.getAttribute("adminLogged") == null;
    }

    @GetMapping
    public ResponseEntity<?> listar(HttpSession session) {
        if (sinSesion(session)) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(packRepository.findAllByOrderByOrdenAsc());
    }

    @PostMapping("/guardar")
    public ResponseEntity<?> guardar(
            @RequestParam(required = false) Long id,
            @RequestParam String nombre,
            @RequestParam(required = false) String descripcion,
            @RequestParam Integer precio,
            @RequestParam(required = false) Integer orden,
            @RequestParam(required = false, value = "imagenFile") MultipartFile imagenFile,
            @RequestParam(required = false) String itemsJson,
            HttpSession session) {

        if (sinSesion(session)) return ResponseEntity.status(401).build();

        try {
            Pack pack;
            if (id != null) {
                pack = packRepository.findById(id).orElse(new Pack());
                packItemRepository.deleteByPackId(pack.getId());
                pack.getItems().clear();
            } else {
                pack = new Pack();
                pack.setDisponible(true);
            }

            pack.setNombre(nombre);
            pack.setDescripcion(descripcion);
            pack.setPrecio(precio);
            pack.setOrden(orden);

            if (imagenFile != null && !imagenFile.isEmpty()) {
                if (pack.getImagen() != null && pack.getImagen().startsWith("http")) {
                    cloudinaryService.eliminarImagen(pack.getImagen());
                }
                pack.setImagen(cloudinaryService.subirImagen(imagenFile));
            }

            packRepository.save(pack);

            // Guardar items del pack: formato "fraganciaId:ml:cantidad|fraganciaId:ml:cantidad"
            if (itemsJson != null && !itemsJson.isEmpty()) {
                for (String itemStr : itemsJson.split("\\|")) {
                    String[] parts = itemStr.split(":");
                    if (parts.length >= 2) {
                        Fragancia f = fraganciaService.buscarPorId(Long.parseLong(parts[0]));
                        if (f != null) {
                            PackItem item = new PackItem();
                            item.setPack(pack);
                            item.setFragancia(f);
                            item.setMl(Integer.parseInt(parts[1]));
                            item.setCantidad(parts.length >= 3 ? Integer.parseInt(parts[2]) : 1);
                            packItemRepository.save(item);
                        }
                    }
                }
            }

            return ResponseEntity.ok(pack);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al guardar pack");
        }
    }

    @PostMapping("/{id}/toggle")
    public ResponseEntity<?> toggle(@PathVariable Long id, HttpSession session) {
        if (sinSesion(session)) return ResponseEntity.status(401).build();
        Pack p = packRepository.findById(id).orElse(null);
        if (p == null) return ResponseEntity.notFound().build();
        p.setDisponible(p.getDisponible() == null || !p.getDisponible());
        packRepository.save(p);
        return ResponseEntity.ok(p);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id, HttpSession session) {
        if (sinSesion(session)) return ResponseEntity.status(401).build();
        packRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}