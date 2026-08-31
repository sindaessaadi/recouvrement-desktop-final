package tn.star.recouvrementbackend.dto;

import tn.star.recouvrementbackend.entities.ModePaiement;
import tn.star.recouvrementbackend.entities.StatutPaiement;

import java.time.LocalDate;

public record PaiementResponse(
        Long id,
        Long memoireId,
        String memoireNumero,
        String client,
        Long montant,
        Long totalDuMemoire,
        LocalDate datePaiement,
        ModePaiement mode,
        StatutPaiement statut,
        String reference
) {
}
