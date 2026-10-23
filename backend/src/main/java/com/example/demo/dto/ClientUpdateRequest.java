package com.example.demo.dto;

import com.example.demo.entity.ClientStatus;
import jakarta.validation.constraints.NotNull;

public record ClientUpdateRequest(
        @NotNull ClientStatus status
) {}