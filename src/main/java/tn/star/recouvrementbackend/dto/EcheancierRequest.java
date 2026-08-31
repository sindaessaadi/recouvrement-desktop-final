package tn.star.recouvrementbackend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record EcheancierRequest(
        @NotNull @Positive Integer ordre,
        @NotNull @Positive Long montant,
        @NotNull LocalDate dateEcheance
) {
}
