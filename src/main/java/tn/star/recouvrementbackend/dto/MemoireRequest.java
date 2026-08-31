package tn.star.recouvrementbackend.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record MemoireRequest(
        @NotNull Long quittanceId,
        @NotNull LocalDate dateCreation,
        @NotNull Integer delaiReglement, // doit valoir 15, 30, 45 ou 60
        String motif,
        String agentTraitant
) {
}
