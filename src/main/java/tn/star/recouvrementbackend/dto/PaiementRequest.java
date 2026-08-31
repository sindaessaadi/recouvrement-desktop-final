package tn.star.recouvrementbackend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import tn.star.recouvrementbackend.entities.ModePaiement;
import tn.star.recouvrementbackend.entities.StatutPaiement;

import java.time.LocalDate;

public record PaiementRequest(
        @NotNull @Positive Long montant,
        @NotNull LocalDate datePaiement,
        @NotNull ModePaiement mode,
        @NotNull StatutPaiement statut,
        String reference
) {
}
