package com.example.elegant_drops.controller;

import com.example.elegant_drops.model.Fragancia;
import com.example.elegant_drops.model.Formato;
import com.example.elegant_drops.repository.VentaRepository;
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

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Controller
@RequestMapping("/${admin.path}")
public class AdminController {

    @Autowired private FraganciasService fraganciaService;
    @Autowired private FraganciasRepository fraganciaRepository;
    @Autowired private FormatoRepository formatoRepository;
    @Autowired private VentaRepository ventaRepository;
    @Value("${admin.path}") private String adminPath;
    @Value("${admin.user}") private String adminUser;
    @Value("${admin.password}") private String adminPassword;
    private final BCryptPasswordEncoder encoder;

    private static final String UPLOAD_DIR = "uploads/images/perfumes/";

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
        model.addAttribute("fragancias", fragancias);
        model.addAttribute("adminPath", adminPath);
        model.addAttribute("ventas", ventaRepository.findAll());
        model.addAttribute("gananciasSemana", ventaRepository.gananciasSemana());
        model.addAttribute("gananciasMes", ventaRepository.gananciasMes());
        model.addAttribute("gananciasAnio", ventaRepository.gananciasAnio());
        return "admin/dashboard";
    }

    @PostMapping("/guardar")
    public String guardar(@ModelAttribute Fragancia fragancia,
                          @RequestParam("imagenFile") MultipartFile imagenFile,
                          HttpSession session) throws IOException {
        if (session.getAttribute("adminLogged") == null) return sinSesion();

        if (fragancia.getId() != null) {
            Fragancia existente = fraganciaService.buscarPorId(fragancia.getId());
            fragancia.setDisponible(existente.getDisponible());
            fragancia.setFormatos(existente.getFormatos());
            if (imagenFile.isEmpty()) {
                fragancia.setImagen(existente.getImagen());
            }
        } else {
            fragancia.setDisponible(true);
        }

        if (!imagenFile.isEmpty()) {
            String extension = imagenFile.getOriginalFilename()
                    .substring(imagenFile.getOriginalFilename().lastIndexOf("."));
            String nombreArchivo = UUID.randomUUID().toString() + extension;
            Path ruta = Paths.get(UPLOAD_DIR + nombreArchivo);
            Files.createDirectories(ruta.getParent());
            Files.write(ruta, imagenFile.getBytes());
            fragancia.setImagen(nombreArchivo);
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

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/";
    }
}