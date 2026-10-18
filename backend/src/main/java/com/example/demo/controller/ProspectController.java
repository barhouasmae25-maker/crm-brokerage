
package com.example.demo.controller;

import com.example.demo.dto.ProspectRequest;
import com.example.demo.dto.ProspectResponse;
import com.example.demo.entity.ProspectSource;
import com.example.demo.entity.ProspectStatus;
import com.example.demo.service.ProspectService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prospects")
public class ProspectController {

    private final ProspectService prospectService;

    public ProspectController(ProspectService prospectService) {
        this.prospectService = prospectService;
    }

    // Create a new prospect
    @PostMapping
    public ResponseEntity<ProspectResponse> createProspect(
            @RequestBody ProspectRequest request,
            Authentication authentication) {

        ProspectResponse response =
                prospectService.createProspect(request, authentication);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Get all prospects with optional filters
    @GetMapping
    public ResponseEntity<List<ProspectResponse>> getProspects(
            @RequestParam(required = false) ProspectStatus status,
            @RequestParam(required = false) ProspectSource source,
            Authentication authentication) {

        return ResponseEntity.ok(
                prospectService.getProspects(
                        status, source, authentication)
        );
    }

    // Get a prospect by ID
    @GetMapping("/{prospectId}")
    public ResponseEntity<ProspectResponse> getProspectById(
            @PathVariable Long prospectId,
            Authentication authentication) {

        return ResponseEntity.ok(
                prospectService.getProspectById(
                        prospectId, authentication)
        );
    }

    // Update a prospect
    @PutMapping("/{prospectId}")
    public ResponseEntity<ProspectResponse> updateProspect(
            @PathVariable Long prospectId,
            @RequestBody ProspectRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                prospectService.updateProspect(
                        prospectId, request, authentication)
        );
    }

    // Reassign a prospect (MANAGER only, checked in service)
    @PutMapping("/{prospectId}/assign")
    public ResponseEntity<ProspectResponse> assignProspect(
            @PathVariable Long prospectId,
            @RequestParam Long agentId,
            Authentication authentication) {

        return ResponseEntity.ok(
                prospectService.assignProspect(
                        prospectId, agentId, authentication)
        );
    }
}
