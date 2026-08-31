package tn.star.recouvrementbackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ContactResponsableRequest(
        @NotBlank String nom,
        String fonction,
        String telephone,
        @Email String email
) {
}
