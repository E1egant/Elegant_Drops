package com.example.elegant_drops.controller;

import com.example.elegant_drops.model.Pedido;
import com.example.elegant_drops.model.Venta;
import com.example.elegant_drops.repository.PedidoRepository;
import com.example.elegant_drops.repository.VentaRepository;
import com.example.elegant_drops.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;

@RestController
public class CheckoutController {

    @Autowired private EmailService emailService;
    @Autowired private VentaRepository ventaRepository;
    @Autowired private PedidoRepository pedidoRepository;

    @Value("${admin.user}") private String adminEmail;
    @Value("${mp.public-key}") private String mpPublicKey;
    @Value("${app.url:http://localhost:8080}") private String appUrl;

    private static final Pattern RUT_PATTERN = Pattern.compile("^[0-9]{7,8}-[0-9Kk]$");
    private static final Pattern TELEFONO_PATTERN = Pattern.compile("^(\\+?56)?[0-9]{8,9}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    private static final Pattern SOLO_LETRAS = Pattern.compile("^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s\\-']{2,50}$");

    private boolean validarRut(String rut) {
        if (rut == null) return false;
        rut = rut.trim().toUpperCase().replace(".", "");
        if (!RUT_PATTERN.matcher(rut).matches()) return false;
        String[] partes = rut.split("-");
        String cuerpo = partes[0];
        char dvIngresado = partes[1].charAt(0);
        int suma = 0, multiplo = 2;
        for (int i = cuerpo.length() - 1; i >= 0; i--) {
            suma += Character.getNumericValue(cuerpo.charAt(i)) * multiplo;
            multiplo = multiplo == 7 ? 2 : multiplo + 1;
        }
        int dvEsperado = 11 - (suma % 11);
        char dvCalculado;
        if (dvEsperado == 11) dvCalculado = '0';
        else if (dvEsperado == 10) dvCalculado = 'K';
        else dvCalculado = Character.forDigit(dvEsperado, 10);
        return dvIngresado == dvCalculado;
    }

    private Map<String, String> validarDatos(String nombre, String apellido, String rut,
                                             String telefono, String correo, String tipo,
                                             String direccion, String estacion) {
        Map<String, String> errores = new LinkedHashMap<>();
        if (!SOLO_LETRAS.matcher(nombre != null ? nombre : "").matches())
            errores.put("nombre", "Nombre inválido — solo letras, mínimo 2 caracteres");
        if (!SOLO_LETRAS.matcher(apellido != null ? apellido : "").matches())
            errores.put("apellido", "Apellido inválido — solo letras, mínimo 2 caracteres");
        if (!validarRut(rut))
            errores.put("rut", "RUT inválido — formato: 12345678-9");
        if (telefono == null || !TELEFONO_PATTERN.matcher(telefono.trim().replace(" ", "")).matches())
            errores.put("telefono", "Teléfono inválido — formato chileno requerido");
        if (correo == null || !EMAIL_PATTERN.matcher(correo.trim()).matches())
            errores.put("correo", "Correo electrónico inválido");
        if ("envio".equals(tipo)) {
            if (direccion == null || direccion.trim().length() < 10)
                errores.put("direccion", "Dirección inválida — mínimo 10 caracteres");
            if (direccion != null && direccion.trim().length() > 200)
                errores.put("direccion", "Dirección demasiado larga");
        }
        if ("retiro".equals(tipo)) {
            if (estacion == null || estacion.trim().isEmpty())
                errores.put("estacion", "Selecciona una estación de retiro");
        }
        return errores;
    }

    @GetMapping("/api/checkout/config")
    public ResponseEntity<?> config() {
        return ResponseEntity.ok(Map.of("publicKey", mpPublicKey));
    }

    @PostMapping("/api/checkout/crear-preferencia")
    public ResponseEntity<?> crearPreferencia(
            @RequestParam String nombre, @RequestParam String apellido,
            @RequestParam String rut, @RequestParam String telefono,
            @RequestParam String correo, @RequestParam String tipo,
            @RequestParam(required = false) String direccion,
            @RequestParam(required = false) String estacion,
            @RequestParam String resumenPedido, @RequestParam String total,
            @RequestParam String itemsJson) {

        Map<String, String> errores = validarDatos(nombre, apellido, rut, telefono, correo, tipo, direccion, estacion);
        if (!errores.isEmpty()) return ResponseEntity.badRequest().body(errores);

        try {
            Pedido pedido = new Pedido();
            pedido.setExternalReference(correo + "-" + System.currentTimeMillis());
            pedido.setNombre(nombre.trim());
            pedido.setApellido(apellido.trim());
            pedido.setRut(rut.trim().toUpperCase());
            pedido.setTelefono(telefono.trim());
            pedido.setCorreo(correo.trim().toLowerCase());
            pedido.setTipoEntrega(tipo);
            pedido.setDireccion(direccion);
            pedido.setEstacion(estacion);
            pedido.setResumenPedido(resumenPedido);
            pedido.setTotal(total);
            pedido.setItemsJson(itemsJson);
            pedido.setEstado("PENDIENTE");
            pedido.setFecha(LocalDateTime.now());
            pedidoRepository.save(pedido);

            String html = construirHtmlPedido(pedido);
            emailService.enviar(pedido.getCorreo(), "Elegant Drops · Pedido recibido", html);
            emailService.enviar(adminEmail, "Nuevo pedido — " + pedido.getNombre() + " " + pedido.getApellido(), html);

            return ResponseEntity.ok(Map.of("ok", true));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/checkout/exito")
    public ResponseEntity<?> exitoApi(
            @RequestParam(required = false) String payment_id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String external_reference) {

        try {
            Pedido pedido = pedidoRepository.findByExternalReference(external_reference).orElse(null);

            if (pedido != null && "PENDIENTE".equals(pedido.getEstado())) {
                pedido.setEstado("COMPLETADO");
                pedidoRepository.save(pedido);

                int totalNumerico = 0;
                StringBuilder detalle = new StringBuilder();
                if (pedido.getItemsJson() != null) {
                    for (String itemStr : pedido.getItemsJson().split("\\|")) {
                        String[] parts = itemStr.split(";");
                        if (parts.length >= 3) {
                            int cantidad = Integer.parseInt(parts[1]);
                            int precio = Integer.parseInt(parts[2]);
                            totalNumerico += precio * cantidad;
                            detalle.append(cantidad).append("x ").append(parts[0])
                                    .append(" — $").append(precio * cantidad).append("\n");
                        }
                    }
                }

                Venta venta = new Venta();
                venta.setFecha(LocalDateTime.now());
                venta.setTotal(totalNumerico);
                venta.setTipoEntrega(pedido.getTipoEntrega());
                venta.setCodigoTransaccion(payment_id != null ? payment_id : "N/A");
                venta.setDetalle(detalle.toString());
                ventaRepository.save(venta);

                String html = construirHtmlPedido(pedido);
                emailService.enviar(pedido.getCorreo(), "Elegant Drops · Confirmación de pedido", html);
                emailService.enviar(adminEmail, "Nuevo pedido — " + pedido.getNombre() + " " + pedido.getApellido(), html);
            }

            if (pedido != null) {
                return ResponseEntity.ok(Map.of(
                        "nombre", pedido.getNombre(),
                        "correo", pedido.getCorreo(),
                        "tipo", pedido.getTipoEntrega(),
                        "total", pedido.getTotal(),
                        "codigoTransaccion", payment_id != null ? payment_id : "N/A"
                ));
            }

            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error al procesar confirmación"));
        }
    }

    private String construirHtmlPedido(Pedido pedido) {
        String entrega = "envio".equals(pedido.getTipoEntrega())
                ? "<p><strong>Dirección:</strong> " + pedido.getDireccion() + "</p>"
                : "<p><strong>Estación de retiro:</strong> Metro " + pedido.getEstacion() + "</p>";

        return """
                <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #1a1714; color: #f5ede8; padding: 40px; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <h1 style="font-size: 24px; letter-spacing: 8px; color: #c9967a; text-transform: uppercase; margin: 0;">Elegant Drops</h1>
                        <p style="font-size: 10px; letter-spacing: 4px; color: #7a6e68; text-transform: uppercase; margin-top: 8px;">Decants & Fragrances</p>
                    </div>
                    <hr style="border: none; border-top: 1px solid rgba(201,150,122,0.2); margin-bottom: 32px;">
                    <h2 style="font-size: 16px; letter-spacing: 4px; color: #f5ede8; text-transform: uppercase; margin-bottom: 24px;">Confirmación de Pedido</h2>
                    <p style="color: #a89890; font-size: 13px; margin-bottom: 24px;">Gracias por tu compra. Aquí está el resumen de tu pedido:</p>
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(201,150,122,0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px; font-size: 13px; line-height: 2;">
                        <p><strong>Nombre:</strong> """ + pedido.getNombre() + " " + pedido.getApellido() + """
                        </p><p><strong>RUT:</strong> """ + pedido.getRut() + """
                        </p><p><strong>Teléfono:</strong> """ + pedido.getTelefono() + """
                        </p><p><strong>Correo:</strong> """ + pedido.getCorreo() + """
                        </p><p><strong>Tipo de entrega:</strong> """ + ("envio".equals(pedido.getTipoEntrega()) ? "Envío a domicilio vía Blue Express" : "Retiro en metro") + """
                        </p>""" + entrega + """
                    </div>
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(201,150,122,0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px; font-size: 13px; line-height: 2;">
                        <h3 style="font-size: 11px; letter-spacing: 3px; color: #c9967a; text-transform: uppercase; margin-bottom: 12px;">Detalle del pedido</h3>
                        """ + pedido.getResumenPedido() + """
                    </div>
                    <div style="text-align: right; font-size: 18px; color: #f5ede8; font-weight: bold; margin-bottom: 32px;">
                        Total: """ + pedido.getTotal() + """
                    </div>
                    <hr style="border: none; border-top: 1px solid rgba(201,150,122,0.1); margin-bottom: 24px;">
                    <p style="font-size: 11px; color: #6b5f58; text-align: center; letter-spacing: 2px; text-transform: uppercase;">Elegant Drops Chile · Excellence in Every Drop</p>
                </div>
                """;
    }
}