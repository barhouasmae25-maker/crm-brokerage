package com.example.demo.repository;

import com.example.demo.entity.Interaction;
import com.example.demo.entity.Prospect;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InteractionRepository
        extends JpaRepository<Interaction, Long> {

    List<Interaction> findByProspectOrderByCreatedAtDesc(
            Prospect prospect
    );
}