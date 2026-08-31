package tn.star.recouvrementbackend.dto;

import tn.star.recouvrementbackend.entities.Branche;

import java.time.LocalDate;

public record ContratResponse(
        Long id,
        String numeroPolice,
        Long clientId,
        String client,
        Branche branche,
        String agence,
        LocalDate dateEffet,
        LocalDate dateEcheanceContrat,
        Long primeBrute,
        Long primeNette,
        VehiculeResponse vehicule
) {
}
