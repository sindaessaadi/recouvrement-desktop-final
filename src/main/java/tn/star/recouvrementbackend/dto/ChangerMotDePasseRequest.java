package tn.star.recouvrementbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangerMotDePasseRequest(
        @NotBlank String ancien,
        @NotBlank @Size(min = 8, message = "Le nouveau mot de passe doit contenir au moins 8 caractères") String nouveau
) {
}
