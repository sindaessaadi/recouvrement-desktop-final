package tn.star.recouvrementbackend.dto;

import tn.star.recouvrementbackend.entities.StatutMemoire;

import java.time.LocalDate;

// Ligne d'historique des memoires d'un client (ecran Suivi des clients / fiche client).
public record MemoireHistoriqueResponse(
        String numero,
        LocalDate date,
        Long montantDu,
        Long montantRegle,
        Long reste,
        StatutMemoire statut,
        LocalDate dernierPaiement
) {
}
