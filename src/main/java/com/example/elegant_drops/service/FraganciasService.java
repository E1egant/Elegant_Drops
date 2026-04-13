package com.example.elegant_drops.service;

import com.example.elegant_drops.model.Fragancia;
import com.example.elegant_drops.repository.FraganciasRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FraganciasService {

    @Autowired
    private FraganciasRepository fraganciaRepository;

    public List<Fragancia> listarTodas() {
        return fraganciaRepository.findAll();
    }

    public void guardar(Fragancia fragancia) {
        fraganciaRepository.save(fragancia);
    }

    public Fragancia buscarPorId(Long id) {
        return fraganciaRepository.findById(id).orElse(null);
    }

    public void eliminar(Long id) {
        fraganciaRepository.deleteById(id);
    }
}