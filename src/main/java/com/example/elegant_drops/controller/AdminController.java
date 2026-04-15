package com.example.elegant_drops.controller;

import com.example.elegant_drops.model.Fragancia;
import com.example.elegant_drops.model.Formato;
import com.example.elegant_drops.model.Resena;
import com.example.elegant_drops.model.Venta;
import com.example.elegant_drops.repository.ResenaRepository;
import com.example.elegant_drops.repository.VentaRepository;
import com.example.elegant_drops.service.CloudinaryService;
import com.example.elegant_drops.service.FraganciasService;
import com.example.elegant_drops.repository.FraganciasRepository;
import com.example.elegant_drops.repository.FormatoRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

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

    private String sinSesion() {
        return "redirect:/" + adminPath + "/login";
    }

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

    @GetMapping("/dashboard")
    public String dashboard(Model model, HttpSession session) {
        if (session.getAttribute("adminLogged") == null) return sinSesion();

        List<Fragancia> fragancias = fraganciaService.listarTodas();
        fragancias.forEach(f -> f.getFormatos().sort(Comparator.comparingInt(Formato::getMl)));

        List<Resena> resenas = resenaRepository.findAllByOrderByFechaDesc();
        List<Venta> ventas = ventaRepository.findAllByOrderByFechaDesc();

        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime inicioSemana = ahora.minusDays(7);
        LocalDateTime inicioMes = ahora.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime inicioAnio = ahora.withDayOfYear(1).withHour(0).withMinute(0).withSecond(0);

        long gananciasSemana = ventas.stream()
                .filter(v -> v.getFecha().isAfter(inicioSemana))
                .mapToLong(Venta::getTotal).sum();

        long gananciasMes = ventas.stream()
                .filter(v -> v.getFecha().isAfter(inicioMes))
                .mapToLong(Venta::getTotal).sum();

        long gananciasAnio = ventas.stream()
                .filter(v -> v.getFecha().isAfter(inicioAnio))
                .mapToLong(Venta::getTotal).sum();

        model.addAttribute("fragancias", fragancias);
        model.addAttribute("resenas", resenas);
        model.addAttribute("ventas", ventas);
        model.addAttribute("gananciasSemana", gananciasSemana);
        model.addAttribute("gananciasMes", gananciasMes);
        model.addAttribute("gananciasAnio", gananciasAnio);
        model.addAttribute("adminPath", adminPath);
        return "admin/dashboard";
    }

    @PostMapping("/guardar")
    public String guardar(@ModelAttribute Fragancia fragancia,
                          @RequestParam("imagenFile") MultipartFile imagenFile,
                          HttpSession session) {
        if (session.getAttribute("adminLogged") == null) return sinSesion();

        try {
            if (fragancia.getId() != null) {
                Fragancia existente = fraganciaService.buscarPorId(fragancia.getId());
                fragancia.setDisponible(existente.getDisponible());
                fragancia.setFormatos(existente.getFormatos());
                if (imagenFile.isEmpty()) {
                    fragancia.setImagen(existente.getImagen());
                } else {
                    if (existente.getImagen() != null && existente.getImagen().startsWith("http")) {
                        cloudinaryService.eliminarImagen(existente.getImagen());
                    }
                    String url = cloudinaryService.subirImagen(imagenFile);
                    fragancia.setImagen(url);
                }
            } else {
                fragancia.setDisponible(true);
                if (!imagenFile.isEmpty()) {
                    String url = cloudinaryService.subirImagen(imagenFile);
                    fragancia.setImagen(url);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        fraganciaService.guardar(fragancia);
        return "redirect:/" + adminPath + "/dashboard";
    }

    @PostMapping("/formato/guardar")
    public String guardarFormato(@RequestParam Long fraganciaId, @ModelAttribute Formato formato, HttpSession session) {
        if (session.getAttribute("adminLogged") == null) return sinSesion();
        Fragancia f = fraganciaService.buscarPorId(fraganciaId);
        if (f != null) {
            formato.setStock(1);
            formato.setFragancia(f);
            f.getFormatos().add(formato);
            fraganciaService.guardar(f);
        }
        return "redirect:/" + adminPath + "/dashboard";
    }

    @GetMapping("/formato/eliminar/{id}")
    public String eliminarFormato(@PathVariable Long id, HttpSession session) {
        if (session.getAttribute("adminLogged") == null) return sinSesion();
        formatoRepository.deleteById(id);
        return "redirect:/" + adminPath + "/dashboard";
    }

    @GetMapping("/toggle/{id}")
    public String toggleStock(@PathVariable Long id, HttpSession session) {
        if (session.getAttribute("adminLogged") == null) return sinSesion();
        Fragancia f = fraganciaRepository.findById(id).orElse(null);
        if (f != null) {
            f.setDisponible(f.getDisponible() == null || !f.getDisponible());
            fraganciaRepository.save(f);
        }
        return "redirect:/" + adminPath + "/dashboard";
    }

    @GetMapping("/eliminar/{id}")
    public String eliminar(@PathVariable Long id, HttpSession session) {
        if (session.getAttribute("adminLogged") == null) return sinSesion();
        fraganciaService.eliminar(id);
        return "redirect:/" + adminPath + "/dashboard";
    }

    @GetMapping("/resena/eliminar/{id}")
    public String eliminarResena(@PathVariable Long id, HttpSession session) {
        if (session.getAttribute("adminLogged") == null) return sinSesion();
        resenaRepository.deleteById(id);
        return "redirect:/" + adminPath + "/dashboard?tab=resenas";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/";
    }
}