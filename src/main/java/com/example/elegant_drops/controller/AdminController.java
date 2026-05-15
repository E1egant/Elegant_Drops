package com.example.elegant_drops.controller;

import com.example.elegant_drops.model.*;
import com.example.elegant_drops.repository.*;
import com.example.elegant_drops.service.CloudinaryService;
import com.example.elegant_drops.service.FraganciasService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

@Controller
@RequestMapping("/${admin.path}")
public class AdminController {

    @Autowired private FraganciasService fraganciaService;
    @Autowired private FraganciasRepository fraganciaRepository;
    @Autowired private FormatoRepository formatoRepository;
    @Autowired private CloudinaryService cloudinaryService;
    @Autowired private ResenaRepository resenaRepository;
    @Autowired private VentaRepository ventaRepository;
    @Value("${admin.path}") private String adminPath;
    @Value("${admin.user}") private String adminUser;
    @Value("${admin.password}") private String adminPassword;
    private final BCryptPasswordEncoder encoder;

    public AdminController(BCryptPasswordEncoder encoder) { this.encoder = encoder; }

    private String sinSesion() { return "redirect:/" + adminPath + "/login"; }

    // ── LOGIN ──────────────────────────────────────────────
    @GetMapping("/login")
    public String showLogin(Model model) {
        model.addAttribute("adminPath", adminPath);
        return "admin/login";
    }

    @PostMapping("/login")
    public String login(@RequestParam String email, @RequestParam String password, HttpSession session) {
        if (adminUser.equals(email) && encoder.matches(password, adminPassword)) {
            session.setAttribute("adminLogged", true);
            return "redirect:/" + adminPath + "/dashboard";
        }
        return "redirect:/" + adminPath + "/login?error=true";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/";
    }

    // ── DASHBOARD (solo sirve el HTML, React toma el control) ──
    @GetMapping("/dashboard")
    public String dashboard(HttpSession session, Model model) {
        if (session.getAttribute("adminLogged") == null) return sinSesion();
        model.addAttribute("adminPath", adminPath);
        return "admin/dashboard";
    }

    // ── API: FRAGANCIAS ────────────────────────────────────
    @GetMapping("/api/fragancias")
    @ResponseBody
    public ResponseEntity<?> listarFragancias(HttpSession session) {
        if (session.getAttribute("adminLogged") == null)
            return ResponseEntity.status(401).build();

        List<Fragancia> fragancias = fraganciaService.listarTodas();
        fragancias.forEach(f -> f.getFormatos().sort(Comparator.comparingInt(Formato::getMl)));
        return ResponseEntity.ok(fragancias);
    }

    @PostMapping("/api/fragancias/guardar")
    @ResponseBody
    public ResponseEntity<?> guardarFragancia(
            @RequestParam(required = false) Long id,
            @RequestParam String nombre,
            @RequestParam String marca,
            @RequestParam(required = false) String concentracion,
            @RequestParam(required = false) String genero,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String descripcion,
            @RequestParam(required = false) Integer orden,
            @RequestParam(required = false) String categoria,
            @RequestParam(value = "imagenFile", required = false) MultipartFile imagenFile,
            HttpSession session) {

        if (session.getAttribute("adminLogged") == null)
            return ResponseEntity.status(401).build();

        try {
            Fragancia fragancia;
            if (id != null) {
                fragancia = fraganciaService.buscarPorId(id);
                if (fragancia == null) return ResponseEntity.notFound().build();
            } else {
                fragancia = new Fragancia();
                fragancia.setDisponible(true);
            }

            fragancia.setNombre(nombre);
            fragancia.setMarca(marca);
            fragancia.setConcentracion(concentracion);
            fragancia.setGenero(genero);
            fragancia.setTipo(tipo);
            fragancia.setDescripcion(descripcion);
            if (orden != null) {
                fragancia.setOrden(orden);
            }
            if (categoria != null && !categoria.isEmpty()) {
                fragancia.setCategoria(CategoriaFragancia.valueOf(categoria));
            }

            if (imagenFile != null && !imagenFile.isEmpty()) {
                if (fragancia.getImagen() != null && fragancia.getImagen().startsWith("http")) {
                    cloudinaryService.eliminarImagen(fragancia.getImagen());
                }
                fragancia.setImagen(cloudinaryService.subirImagen(imagenFile));
            }

            fraganciaService.guardar(fragancia);
            return ResponseEntity.ok(fragancia);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al guardar");
        }
    }

    @DeleteMapping("/api/fragancias/{id}")
    @ResponseBody
    public ResponseEntity<?> eliminarFragancia(@PathVariable Long id, HttpSession session) {
        if (session.getAttribute("adminLogged") == null)
            return ResponseEntity.status(401).build();
        fraganciaService.eliminar(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/api/fragancias/{id}/toggle")
    @ResponseBody
    public ResponseEntity<?> toggleDisponible(@PathVariable Long id, HttpSession session) {
        if (session.getAttribute("adminLogged") == null)
            return ResponseEntity.status(401).build();
        Fragancia f = fraganciaRepository.findById(id).orElse(null);
        if (f == null) return ResponseEntity.notFound().build();
        f.setDisponible(f.getDisponible() == null || !f.getDisponible());
        fraganciaRepository.save(f);
        return ResponseEntity.ok(f);
    }

    @PostMapping("/api/fragancias/reordenar")
    @ResponseBody
    public ResponseEntity<?> reordenar(@RequestBody List<Map<String, Object>> orden, HttpSession session) {
        if (session.getAttribute("adminLogged") == null)
            return ResponseEntity.status(401).build();
        for (Map<String, Object> item : orden) {
            Long id = Long.valueOf(item.get("id").toString());
            Integer nuevoOrden = Integer.valueOf(item.get("orden").toString());
            Fragancia f = fraganciaRepository.findById(id).orElse(null);
            if (f != null) {
                f.setOrden(nuevoOrden);
                fraganciaRepository.save(f);
            }
        }
        return ResponseEntity.ok().build();
    }

    // ── API: FORMATOS ──────────────────────────────────────
    @PostMapping("/api/formatos/guardar")
    @ResponseBody
    public ResponseEntity<?> guardarFormato(
            @RequestParam Long fraganciaId,
            @RequestParam Integer ml,
            @RequestParam Integer precio,
            HttpSession session) {

        if (session.getAttribute("adminLogged") == null)
            return ResponseEntity.status(401).build();

        Fragancia f = fraganciaService.buscarPorId(fraganciaId);
        if (f == null) return ResponseEntity.notFound().build();

        Formato formato = new Formato();
        formato.setMl(ml);
        formato.setPrecio(precio);
        formato.setStock(1);
        formato.setFragancia(f);
        f.getFormatos().add(formato);
        fraganciaService.guardar(f);
        return ResponseEntity.ok(f);
    }

    @DeleteMapping("/api/formatos/{id}")
    @ResponseBody
    public ResponseEntity<?> eliminarFormato(@PathVariable Long id, HttpSession session) {
        if (session.getAttribute("adminLogged") == null)
            return ResponseEntity.status(401).build();
        formatoRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ── API: VENTAS Y RESEÑAS ──────────────────────────────
    @GetMapping("/api/ventas")
    @ResponseBody
    public ResponseEntity<?> listarVentas(HttpSession session) {
        if (session.getAttribute("adminLogged") == null)
            return ResponseEntity.status(401).build();

        List<Venta> ventas = ventaRepository.findAllByOrderByFechaDesc();
        LocalDateTime ahora = LocalDateTime.now();

        long gananciasSemana = ventas.stream()
                .filter(v -> v.getFecha().isAfter(ahora.minusDays(7)))
                .mapToLong(Venta::getTotal).sum();
        long gananciasMes = ventas.stream()
                .filter(v -> v.getFecha().isAfter(ahora.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0)))
                .mapToLong(Venta::getTotal).sum();
        long gananciasAnio = ventas.stream()
                .filter(v -> v.getFecha().isAfter(ahora.withDayOfYear(1).withHour(0).withMinute(0).withSecond(0)))
                .mapToLong(Venta::getTotal).sum();

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("ventas", ventas);
        resultado.put("gananciasSemana", gananciasSemana);
        resultado.put("gananciasMes", gananciasMes);
        resultado.put("gananciasAnio", gananciasAnio);
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/api/resenas")
    @ResponseBody
    public ResponseEntity<?> listarResenas(HttpSession session) {
        if (session.getAttribute("adminLogged") == null)
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(resenaRepository.findAllByOrderByFechaDesc());
    }

    @DeleteMapping("/api/resenas/{id}")
    @ResponseBody
    public ResponseEntity<?> eliminarResena(@PathVariable Long id, HttpSession session) {
        if (session.getAttribute("adminLogged") == null)
            return ResponseEntity.status(401).build();
        resenaRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}