package tn.star.recouvrementbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record QuittanceRequest(
        @NotBlank String identifiant,
        @NotNull Long clientId,
        @NotNull Long contratId,
        String agence,
        @NotNull LocalDate emission,
        @NotNull LocalDate echeance,
        @NotNull @Positive Long montant
) {
}
