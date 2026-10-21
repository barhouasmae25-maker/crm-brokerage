package com.example.demo.dto;

import com.example.demo.entity.ClientStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ClientResponse(
        Long id,
        String accountNumber,
        Long accountRequestId,
        Long prospectId,
        String firstName,
        String lastName,
        String email,
        String phone,
        BigDecimal balance,
        ClientStatus status,
        Long assignedToId,
        String assignedToEmail,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}