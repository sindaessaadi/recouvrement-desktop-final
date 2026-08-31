package tn.star.recouvrementbackend.dto;

import tn.star.recouvrementbackend.entities.EtapeMemoire;

public record HistoriqueStatutResponse(
        Long id,
        EtapeMemoire etape,
        String commentaire
) {
}
