package com.example.elegant_drops.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class EmailService {

    @Value("${brevo.api.key}")
    private String apiKey;

    public void enviar(String para, String asunto, String htmlContent) {
        try {
            String body = """
                {
                    "sender": {"name": "Elegant Drops", "email": "ventas.elegantdrops@gmail.com"},
                    "to": [{"email": "%s"}],
                    "subject": "%s",
                    "htmlContent": "%s"
                }
                """.formatted(para, asunto, htmlContent.replace("\"", "\\\"").replace("\n", "").replace("\r", ""));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("accept", "application/json")
                    .header("api-key", apiKey)
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("Brevo response: " + response.statusCode() + " - " + response.body());

        } catch (Exception e) {
            System.err.println("Error enviando correo: " + e.getMessage());
        }
    }
}