package tn.star.recouvrementbackend.dto;

import java.util.List;

public record DashboardResponse(
        int memoiresGeneresCeMois,
        long creancesEchues,
        long encaissementsCeMois,
        int tauxRecouvrementCeMois,
        List<AncienneteBucketResponse> anciennete,
        List<EvolutionMoisResponse> evolution,
        List<MemoireRecentResponse> memoiresRecents,
        List<RepartitionStatutResponse> repartitionStatut
) {
}
