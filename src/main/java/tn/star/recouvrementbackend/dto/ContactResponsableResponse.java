package tn.star.recouvrementbackend.dto;

public record ContactResponsableResponse(
        Long id,
        String nom,
        String fonction,
        String telephone,
        String email
) {
}
