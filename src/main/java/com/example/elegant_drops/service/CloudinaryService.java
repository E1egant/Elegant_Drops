package com.example.elegant_drops.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    public String subirImagen(MultipartFile archivo) throws IOException {
        Map resultado = cloudinary.uploader().upload(
                archivo.getBytes(),
                ObjectUtils.asMap(
                        "folder", "elegant_drops/perfumes",
                        "resource_type", "auto"
                )
        );
        return (String) resultado.get("secure_url");
    }

    public void eliminarImagen(String url) {
        try {
            String publicId = extraerPublicId(url);
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private String extraerPublicId(String url) {
        if (url == null || !url.contains("cloudinary")) return null;
        String sinExtension = url.substring(0, url.lastIndexOf('.'));
        return sinExtension.substring(sinExtension.indexOf("elegant_drops"));
    }
}