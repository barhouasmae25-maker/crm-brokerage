package com.example.demo.controller;

import com.example.demo.dto.InteractionRequest;
import com.example.demo.dto.InteractionResponse;
import com.example.demo.service.InteractionService;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class InteractionController {

    private final InteractionService interactionService;

    public InteractionController(
            InteractionService interactionService
    ) {
        this.interactionService = interactionService;
    }

    // POST /api/prospects/{prospectId}/interactions
    @PostMapping("/prospects/{prospectId}/interactions")
    public InteractionResponse createProspectInteraction(
            @PathVariable Long prospectId,
            @Valid @RequestBody InteractionRequest request,
            Authentication authentication
    ) {
        return interactionService.createProspectInteraction(
                prospectId,
                request,
                authentication
        );
    }

    // GET /api/prospects/{prospectId}/interactions
    @GetMapping("/prospects/{prospectId}/interactions")
    public List<InteractionResponse> getProspectInteractions(
            @PathVariable Long prospectId,
            Authentication authentication
    ) {
        return interactionService.getProspectInteractions(
                prospectId,
                authentication
        );
    }
}