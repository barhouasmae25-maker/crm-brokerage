
package com.example.demo.dto;

import com.example.demo.entity.Interaction;
import com.example.demo.entity.InteractionOutcome;
import com.example.demo.entity.InteractionType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record InteractionResponse(
        Long id,
        InteractionType type,
        String notes,
        InteractionOutcome outcome,
        String nextAction,
        LocalDate nextActionDate,
        LocalDateTime createdAt,
        Long prospectId,
        Long clientId,
        Long createdById
) {
    public static InteractionResponse from(Interaction interaction) {
        return new InteractionResponse(
                interaction.getId(),
                interaction.getType(),
                interaction.getNotes(),
                interaction.getOutcome(),
                interaction.getNextAction(),
                interaction.getNextActionDate(),
                interaction.getCreatedAt(),
                interaction.getProspect() != null
                        ? interaction.getProspect().getId()
                        : null,
                interaction.getClient() != null
                        ? interaction.getClient().getId()
                        : null,
                interaction.getCreatedBy() != null
                        ? interaction.getCreatedBy().getId()
                        : null
        );
    }
}
