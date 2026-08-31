package tn.star.recouvrementbackend.dto;

import jakarta.validation.constraints.NotNull;
import tn.star.recouvrementbackend.entities.EtapeMemoire;

public record HistoriqueStatutRequest(
        @NotNull EtapeMemoire etape,
        String commentaire
) {
}
