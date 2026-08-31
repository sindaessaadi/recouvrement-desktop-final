package tn.star.recouvrementbackend.dto;

import tn.star.recouvrementbackend.entities.Branche;

public record EtatArriereRowResponse(
        String client,
        String police,
        Branche branche,
        Long montantEmis,
        Long encaissement,
        Long solde,
        int taux
) {
}
