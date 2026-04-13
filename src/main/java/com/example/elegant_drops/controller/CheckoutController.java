package com.example.elegant_drops.controller;

import com.example.elegant_drops.model.Venta;
import com.example.elegant_drops.repository.VentaRepository;
import com.example.elegant_drops.service.EmailService;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.resources.preference.Preference;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Controller
public class CheckoutController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private VentaRepository ventaRepository;

    @Value("${admin.user}")
    private String adminEmail;

    @Value("${mp.public-key}")
    private String mpPublicKey;

    @Value("${app.url:http://localhost:8080}")
    private String appUrl;

    @GetMapping("/checkout")
    public String checkout(Model model) {
        model.addAttribute("mpPublicKey", mpPublicKey);
        return "checkout";
    }

    @PostMapping("/checkout/crear-preferencia")
    @ResponseBody
    public String crearPreferencia(
            @RequestParam String nombre,
            @RequestParam String apellido,
            @RequestParam String rut,
            @RequestParam String telefono,
            @RequestParam String correo,
            @RequestParam String tipo,
            @RequestParam(required = false) String direccion,
            @RequestParam(required = false) String estacion,
            @RequestParam String resumenPedido,
            @RequestParam String total,
            @RequestParam String itemsJson,
            HttpSession session) {

        try {
            session.setAttribute("pedido_nombre", nombre);
            session.setAttribute("pedido_apellido", apellido);
            session.setAttribute("pedido_rut", rut);
            session.setAttribute("pedido_telefono", telefono);
            session.setAttribute("pedido_correo", correo);
            session.setAttribute("pedido_tipo", tipo);
            session.setAttribute("pedido_direccion", direccion);
            session.setAttribute("pedido_estacion", estacion);
            session.setAttribute("pedido_resumen", resumenPedido);
            session.setAttribute("pedido_total", total);
            session.setAttribute("pedido_itemsJson", itemsJson);

            List<PreferenceItemRequest> items = new ArrayList<>();
            String[] itemsArray = itemsJson.split("\\|");

            for (String itemStr : itemsArray) {
                String[] parts = itemStr.split(";");
                if (parts.length >= 4) {
                    String itemNombre = parts[0];
                    int cantidad = Integer.parseInt(parts[1]);
                    int precio = Integer.parseInt(parts[2]);

                    PreferenceItemRequest item = PreferenceItemRequest.builder()
                            .title(itemNombre)
                            .quantity(cantidad)
                            .unitPrice(new BigDecimal(precio))
                            .currencyId("CLP")
                            .build();
                    items.add(item);
                }
            }

            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success(appUrl + "/checkout/exito")
                    .failure(appUrl + "/checkout/fallo")
                    .pending(appUrl + "/checkout/pendiente")
                    .build();

            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(items)
                    .backUrls(backUrls)
                    .autoReturn("approved")
                    .externalReference(correo + "-" + System.currentTimeMillis())
                    .build();

            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);

            session.setAttribute("pedido_preferenceId", preference.getId());

            return preference.getId();

        } catch (Exception e) {
            e.printStackTrace();
            return "error";
        }
    }

    @GetMapping("/checkout/exito")
    public String exito(@RequestParam(required = false) String payment_id,
                        @RequestParam(required = false) String status,
                        HttpSession session, Model model) {

        String nombre = (String) session.getAttribute("pedido_nombre");
        String apellido = (String) session.getAttribute("pedido_apellido");
        String rut = (String) session.getAttribute("pedido_rut");
        String telefono = (String) session.getAttribute("pedido_telefono");
        String correo = (String) session.getAttribute("pedido_correo");
        String tipo = (String) session.getAttribute("pedido_tipo");
        String direccion = (String) session.getAttribute("pedido_direccion");
        String estacion = (String) session.getAttribute("pedido_estacion");
        String resumenPedido = (String) session.getAttribute("pedido_resumen");
        String total = (String) session.getAttribute("pedido_total");
        String itemsJson = (String) session.getAttribute("pedido_itemsJson");

        if (correo != null) {
            // Registrar venta
            try {
                int totalNumerico = 0;
                StringBuilder detalle = new StringBuilder();

                if (itemsJson != null) {
                    String[] itemsArray = itemsJson.split("\\|");
                    for (String itemStr : itemsArray) {
                        String[] parts = itemStr.split(";");
                        if (parts.length >= 4) {
                            String itemNombre = parts[0];
                            int cantidad = Integer.parseInt(parts[1]);
                            int precio = Integer.parseInt(parts[2]);
                            totalNumerico += precio * cantidad;
                            detalle.append(cantidad).append("x ")
                                    .append(itemNombre)
                                    .append(" — $").append(precio * cantidad)
                                    .append("\n");
                        }
                    }
                }

                Venta venta = new Venta();
                venta.setFecha(LocalDateTime.now());
                venta.setTotal(totalNumerico);
                venta.setTipoEntrega(tipo);
                venta.setCodigoTransaccion(payment_id != null ? payment_id : "N/A");
                venta.setDetalle(detalle.toString());
                ventaRepository.save(venta);

            } catch (Exception e) {
                e.printStackTrace();
            }

            // Enviar correos
            String html = construirHtmlPedido(tipo, nombre, apellido, rut, telefono,
                    correo, direccion, estacion, resumenPedido, total);
            emailService.enviar(correo, "Elegant Drops · Confirmación de pedido", html);
            emailService.enviar(adminEmail, "Nuevo pedido — " + nombre + " " + apellido, html);

            // Limpiar sesión
            session.removeAttribute("pedido_nombre");
            session.removeAttribute("pedido_apellido");
            session.removeAttribute("pedido_rut");
            session.removeAttribute("pedido_telefono");
            session.removeAttribute("pedido_correo");
            session.removeAttribute("pedido_tipo");
            session.removeAttribute("pedido_direccion");
            session.removeAttribute("pedido_estacion");
            session.removeAttribute("pedido_resumen");
            session.removeAttribute("pedido_total");
            session.removeAttribute("pedido_itemsJson");
            session.removeAttribute("pedido_preferenceId");
        }

        model.addAttribute("nombre", nombre);
        model.addAttribute("correo", correo);
        model.addAttribute("tipo", tipo);
        model.addAttribute("total", total);
        return "confirmacion";
    }

    @GetMapping("/checkout/fallo")
    public String fallo(Model model) {
        model.addAttribute("mensaje", "El pago no pudo procesarse. Por favor intenta nuevamente.");
        return "error-pago";
    }

    @GetMapping("/checkout/pendiente")
    public String pendiente(Model model) {
        model.addAttribute("mensaje", "Tu pago está pendiente de confirmación. Te avisaremos por correo.");
        return "error-pago";
    }

    private String construirHtmlPedido(String tipo, String nombre, String apellido,
                                       String rut, String telefono, String correo,
                                       String direccion, String estacion,
                                       String resumenPedido, String total) {

        String entrega = "envio".equals(tipo)
                ? "<p><strong>Dirección:</strong> " + direccion + "</p>"
                : "<p><strong>Estación de retiro:</strong> Metro " + estacion + "</p>";

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
                        <p><strong>Nombre:</strong> """ + nombre + " " + apellido + """
                        </p>
                        <p><strong>RUT:</strong> """ + rut + """
                        </p>
                        <p><strong>Teléfono:</strong> """ + telefono + """
                        </p>
                        <p><strong>Correo:</strong> """ + correo + """
                        </p>
                        <p><strong>Tipo de entrega:</strong> """ + ("envio".equals(tipo) ? "Envío a domicilio vía Blue Express" : "Retiro en metro") + """
                        </p>
                        """ + entrega + """
                    </div>
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(201,150,122,0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px; font-size: 13px; line-height: 2;">
                        <h3 style="font-size: 11px; letter-spacing: 3px; color: #c9967a; text-transform: uppercase; margin-bottom: 12px;">Detalle del pedido</h3>
                        """ + resumenPedido + """
                    </div>
                    <div style="text-align: right; font-size: 18px; color: #f5ede8; font-weight: bold; margin-bottom: 32px;">
                        Total: """ + total + """
                    </div>
                    <hr style="border: none; border-top: 1px solid rgba(201,150,122,0.1); margin-bottom: 24px;">
                    <p style="font-size: 11px; color: #6b5f58; text-align: center; letter-spacing: 2px; text-transform: uppercase;">Elegant Drops Chile · Excellence in Every Drop</p>
                </div>
                """;
    }
}