package tn.star.recouvrementbackend.dto;

import tn.star.recouvrementbackend.entities.Branche;
import tn.star.recouvrementbackend.entities.StatutQuittance;

import java.time.LocalDate;

public record QuittanceResponse(
        Long id,
        String identifiant,
        Long clientId,
        String client,
        Long contratId,
        String police,
        Branche branche,
        String agence,
        LocalDate emission,
        LocalDate echeance,
        Long montant,
        Long frais,
        Long taxe,
        Long fga,
        Long montantDu,
        StatutQuittance statut,
        boolean hasMemoire,
        LocalDate derniereRelance
) {
}
