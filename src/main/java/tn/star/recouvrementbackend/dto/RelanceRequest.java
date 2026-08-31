package tn.star.recouvrementbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import tn.star.recouvrementbackend.entities.TypeRelance;

public record RelanceRequest(
        @NotNull Long memoireId,
        @NotNull TypeRelance type,
        String canal,
        @NotBlank String utilisateur,
        String resultat,
        String message
) {
}
