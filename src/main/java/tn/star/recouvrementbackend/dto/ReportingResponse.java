package tn.star.recouvrementbackend.dto;

import java.util.List;

public record ReportingResponse(
        List<EtatArriereRowResponse> etatDetaille,
        List<ArriereParBrancheResponse> arriereParBranche,
        List<EvolutionBrancheResponse> evolution
) {
}
