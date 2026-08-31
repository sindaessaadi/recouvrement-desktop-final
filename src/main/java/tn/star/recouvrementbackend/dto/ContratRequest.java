package tn.star.recouvrementbackend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import tn.star.recouvrementbackend.entities.Branche;

import java.time.LocalDate;

public record ContratRequest(
        @NotBlank String numeroPolice,
        @NotNull Long clientId,
        @NotNull Branche branche,
        String agence,
        LocalDate dateEffet,
        LocalDate dateEcheanceContrat,
        @Positive Long primeBrute,
        @Valid VehiculeRequest vehicule
) {
}
