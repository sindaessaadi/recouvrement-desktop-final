package tn.star.recouvrementbackend.dto;

import java.time.LocalDate;

public record EcheancierResponse(
        Long id,
        Integer ordre,
        Long montant,
        LocalDate dateEcheance,
        boolean reglee
) {
}
