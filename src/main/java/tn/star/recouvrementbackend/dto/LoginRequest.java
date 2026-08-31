package tn.star.recouvrementbackend.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank String email,
        @NotBlank String motDePasse
) {
}
