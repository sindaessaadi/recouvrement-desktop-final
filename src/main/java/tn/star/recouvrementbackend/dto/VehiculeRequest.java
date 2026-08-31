package tn.star.recouvrementbackend.dto;

public record VehiculeRequest(
        String immatriculation,
        String marque,
        String modele,
        Integer anneeMiseEnCirculation,
        String usage
) {
}
