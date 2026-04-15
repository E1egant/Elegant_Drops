package com.example.elegant_drops.controller;

import com.example.elegant_drops.model.Pedido;
import com.example.elegant_drops.model.Venta;
import com.example.elegant_drops.repository.PedidoRepository;
import com.example.elegant_drops.repository.VentaRepository;
import com.example.elegant_drops.service.EmailService;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.resources.preference.Preference;
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

    @Autowired private EmailService emailService;
    @Autowired private VentaRepository ventaRepository;
    @Autowired private PedidoRepository pedidoRepository;

    @Value("${admin.user}") private String adminEmail;
    @Value("${mp.public-key}") private String mpPublicKey;
    @Value("${app.url:http://localhost:8080}") private String appUrl;

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
            @RequestParam String itemsJson) {

        try {
            String externalReference = correo + "-" + System.currentTimeMillis();

            Pedido pedido = new Pedido();
            pedido.setExternalReference(externalReference);
            pedido.setNombre(nombre);
            pedido.setApellido(apellido);
            pedido.setRut(rut);
            pedido.setTelefono(telefono);
            pedido.setCorreo(correo);
            pedido.setTipoEntrega(tipo);
            pedido.setDireccion(direccion);
            pedido.setEstacion(estacion);
            pedido.setResumenPedido(resumenPedido);
            pedido.setTotal(total);
            pedido.setItemsJson(itemsJson);
            pedido.setEstado("PENDIENTE");
            pedido.setFecha(LocalDateTime.now());
            pedidoRepository.save(pedido);
            System.out.println("=== PEDIDO GUARDADO: " + externalReference + " ===");

            List<PreferenceItemRequest> items = new ArrayList<>();
            String[] itemsArray = itemsJson.split("\\|");

            for (String itemStr : itemsArray) {
                String[] parts = itemStr.split(";");
                if (parts.length >= 4) {
                    PreferenceItemRequest item = PreferenceItemRequest.builder()
                            .title(parts[0])
                            .quantity(Integer.parseInt(parts[1]))
                            .unitPrice(new BigDecimal(parts[2]))
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
                    .externalReference(externalReference)
                    .build();

            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);

            return preference.getId();

        } catch (Exception e) {
            e.printStackTrace();
            return "error";
        }
    }

    @GetMapping("/checkout/exito")
    public String exito(
            @RequestParam(required = false) String payment_id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String external_reference,
            Model model) {

        System.out.println("=== CHECKOUT EXITO ===");
        System.out.println("payment_id: " + payment_id);
        System.out.println("status: " + status);
        System.out.println("external_reference: " + external_reference);

        try {
            Pedido pedido = pedidoRepository.findByExternalReference(external_reference).orElse(null);
            System.out.println("pedido encontrado: " + (pedido != null ? pedido.getEstado() : "NULL"));

            if (pedido != null && "PENDIENTE".equals(pedido.getEstado())) {
                System.out.println("=== ENTRANDO AL IF ===");

                pedido.setEstado("COMPLETADO");
                pedidoRepository.save(pedido);
                System.out.println("=== PEDIDO MARCADO COMPLETADO ===");

                int totalNumerico = 0;
                StringBuilder detalle = new StringBuilder();

                if (pedido.getItemsJson() != null) {
                    for (String itemStr : pedido.getItemsJson().split("\\|")) {
                        String[] parts = itemStr.split(";");
                        if (parts.length >= 4) {
                            int cantidad = Integer.parseInt(parts[1]);
                            int precio = Integer.parseInt(parts[2]);
                            totalNumerico += precio * cantidad;
                            detalle.append(cantidad).append("x ")
                                    .append(parts[0])
                                    .append(" — $").append(precio * cantidad)
                                    .append("\n");
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
                System.out.println("=== VENTA GUARDADA: $" + totalNumerico + " ===");

                String html = construirHtmlPedido(pedido);
                emailService.enviar(pedido.getCorreo(), "Elegant Drops · Confirmación de pedido", html);
                emailService.enviar(adminEmail, "Nuevo pedido — " + pedido.getNombre() + " " + pedido.getApellido(), html);
                System.out.println("=== CORREOS ENVIADOS ===");

                model.addAttribute("nombre", pedido.getNombre());
                model.addAttribute("correo", pedido.getCorreo());
                model.addAttribute("tipo", pedido.getTipoEntrega());
                model.addAttribute("total", pedido.getTotal());
                model.addAttribute("codigoTransaccion", payment_id != null ? payment_id : "N/A");

            } else {
                System.out.println("=== NO ENTRO AL IF — pedido: " + (pedido != null ? pedido.getEstado() : "NULL") + " ===");
            }

        } catch (Exception e) {
            System.out.println("=== ERROR EN EXITO: " + e.getMessage() + " ===");
            e.printStackTrace();
        }

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
                        </p>
                        <p><strong>RUT:</strong> """ + pedido.getRut() + """
                        </p>
                        <p><strong>Teléfono:</strong> """ + pedido.getTelefono() + """
                        </p>
                        <p><strong>Correo:</strong> """ + pedido.getCorreo() + """
                        </p>
                        <p><strong>Tipo de entrega:</strong> """ + ("envio".equals(pedido.getTipoEntrega()) ? "Envío a domicilio vía Blue Express" : "Retiro en metro") + """
                        </p>
                        """ + entrega + """
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