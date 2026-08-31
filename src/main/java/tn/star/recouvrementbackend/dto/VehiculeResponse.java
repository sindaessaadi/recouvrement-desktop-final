package tn.star.recouvrementbackend.dto;

public record VehiculeResponse(
        Long id,
        String immatriculation,
        String marque,
        String modele,
        Integer anneeMiseEnCirculation,
        String usage
) {
}
