package com.example.demo.controller;

import com.example.demo.dto.ClientResponse;
import com.example.demo.dto.ClientUpdateRequest;
import com.example.demo.entity.ClientStatus;
import com.example.demo.service.ClientService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    public record CreateClientRequest(Long accountRequestId) {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClientResponse create(
            @RequestBody CreateClientRequest request,
            Authentication authentication
    ) {
        if (request == null || request.accountRequestId() == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "accountRequestId is required"
            );
        }

        return clientService.createFromApprovedRequest(
                request.accountRequestId(), authentication
        );
    }

    @GetMapping
    public List<ClientResponse> findAll(
            @RequestParam(required = false) ClientStatus status,
            @RequestParam(required = false) Long assignedTo,
            Authentication authentication
    ) {
        return clientService.findAll(status, assignedTo, authentication);
    }

    @GetMapping("/{clientId}")
    public ClientResponse findById(
            @PathVariable Long clientId,
            Authentication authentication
    ) {
        return clientService.findById(clientId, authentication);
    }

    @PutMapping("/{clientId}")
    public ClientResponse update(
            @PathVariable Long clientId,
            @Valid @RequestBody ClientUpdateRequest request,
            Authentication authentication
    ) {
        return clientService.update(clientId, request, authentication);
    }
}