
package com.example.demo.controller;

import com.example.demo.dto.AccountRequestCreateRequest;
import com.example.demo.dto.AccountRequestResponse;
import com.example.demo.dto.AccountRequestStatusRequest;
import com.example.demo.service.AccountRequestService;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/account-requests")
public class AccountRequestController {

    private final AccountRequestService accountRequestService;

    public AccountRequestController(
            AccountRequestService accountRequestService
    ) {
        this.accountRequestService = accountRequestService;
    }

    @PostMapping
    public AccountRequestResponse create(
            @Valid @RequestBody AccountRequestCreateRequest request,
            Authentication authentication
    ) {
        return accountRequestService.create(request, authentication);
    }

    @GetMapping
    public List<AccountRequestResponse> findAll(
            Authentication authentication
    ) {
        return accountRequestService.findAll(authentication);
    }

    @GetMapping("/{requestId}")
    public AccountRequestResponse findById(
            @PathVariable Long requestId,
            Authentication authentication
    ) {
        return accountRequestService.findById(
                requestId, authentication
        );
    }

    @PutMapping("/{requestId}/status")
    public AccountRequestResponse changeStatus(
            @PathVariable Long requestId,
            @Valid @RequestBody AccountRequestStatusRequest request,
            Authentication authentication
    ) {
        return accountRequestService.changeStatus(
                requestId, request, authentication
        );
    }

    @PutMapping("/{requestId}/documents/{docId}/verify")
    public AccountRequestResponse verifyDocument(
            @PathVariable Long requestId,
            @PathVariable Long docId,
            Authentication authentication
    ) {
        return accountRequestService.verifyDocument(
                requestId, docId, authentication
        );
    }
}
