package com.example.demo.dto;

import com.example.demo.entity.InteractionOutcome;
import com.example.demo.entity.InteractionType;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record InteractionRequest(

        @NotNull
        InteractionType type,

        String notes,

        @NotNull
        InteractionOutcome outcome,

        String nextAction,

        LocalDate nextActionDate

) {}