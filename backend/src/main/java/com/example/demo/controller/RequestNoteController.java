package com.example.demo.controller;

import com.example.demo.dto.RequestNoteCreateRequest;
import com.example.demo.dto.RequestNoteResponse;
import com.example.demo.service.RequestNoteService;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/account-requests/{requestId}/notes")
public class RequestNoteController {

    private final RequestNoteService requestNoteService;

    public RequestNoteController(
            RequestNoteService requestNoteService
    ) {
        this.requestNoteService = requestNoteService;
    }

    @GetMapping
    public List<RequestNoteResponse> findAll(
            @PathVariable Long requestId,
            Authentication authentication
    ) {
        return requestNoteService.findByRequestId(
                requestId,
                authentication
        );
    }

    @PostMapping
    public RequestNoteResponse create(
            @PathVariable Long requestId,
            @Valid @RequestBody RequestNoteCreateRequest request,
            Authentication authentication
    ) {
        return requestNoteService.create(
                requestId,
                request,
                authentication
        );
    }
}