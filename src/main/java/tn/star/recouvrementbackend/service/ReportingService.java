package tn.star.recouvrementbackend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.star.recouvrementbackend.dto.ArriereParBrancheResponse;
import tn.star.recouvrementbackend.dto.EtatArriereRowResponse;
import tn.star.recouvrementbackend.dto.EvolutionBrancheResponse;
import tn.star.recouvrementbackend.dto.ReportingResponse;
import tn.star.recouvrementbackend.entities.Branche;
import tn.star.recouvrementbackend.entities.Quittance;
import tn.star.recouvrementbackend.repository.QuittanceRepository;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

// Vue agregee pure : aucune donnee stockee ici, tout est recalcule a partir des Quittance
// a chaque appel (voir CLAUDE.md - Reporting n'est pas une entite).
@Service
public class ReportingService {

    private final QuittanceRepository quittanceRepository;
    private final QuittanceService quittanceService;

    public ReportingService(QuittanceRepository quittanceRepository, QuittanceService quittanceService) {
        this.quittanceRepository = quittanceRepository;
        this.quittanceService = quittanceService;
    }

    @Transactional(readOnly = true)
    public ReportingResponse getReporting() {
        List<Quittance> quittances = quittanceRepository.findAll();

        List<EtatArriereRowResponse> etatDetaille = quittances.stream()
                .map(this::versLigne)
                .toList();

        Map<Branche, Long> soldeParBranche = new LinkedHashMap<>();
        Map<Branche, Long> emisParBranche = new LinkedHashMap<>();
        Map<Branche, Long> encaisseParBranche = new LinkedHashMap<>();

        for (EtatArriereRowResponse ligne : etatDetaille) {
            if (ligne.branche() == null) {
                continue;
            }
            soldeParBranche.merge(ligne.branche(), ligne.solde(), Long::sum);
            emisParBranche.merge(ligne.branche(), ligne.montantEmis(), Long::sum);
            encaisseParBranche.merge(ligne.branche(), ligne.encaissement(), Long::sum);
        }

        long totalSolde = soldeParBranche.values().stream().mapToLong(Long::longValue).sum();

        List<ArriereParBrancheResponse> arriereParBranche = soldeParBranche.entrySet().stream()
                .map(e -> new ArriereParBrancheResponse(
                        e.getKey().name(),
                        e.getValue(),
                        totalSolde > 0 ? (int) Math.round(e.getValue() * 100.0 / totalSolde) : 0
                ))
                .toList();

        List<EvolutionBrancheResponse> evolution = emisParBranche.entrySet().stream()
                .map(e -> new EvolutionBrancheResponse(
                        e.getKey().name(),
                        e.getValue(),
                        encaisseParBranche.getOrDefault(e.getKey(), 0L)
                ))
                .toList();

        return new ReportingResponse(etatDetaille, arriereParBranche, evolution);
    }

    private EtatArriereRowResponse versLigne(Quittance quittance) {
        long montantDu = quittanceService.getMontantDu(quittance);
        long encaissement = quittance.getMemoire() != null ? quittance.getMemoire().getMontantRegle() : 0L;
        long solde = Math.max(0L, montantDu - encaissement);
        int taux = montantDu > 0 ? (int) Math.round(encaissement * 100.0 / montantDu) : 0;

        return new EtatArriereRowResponse(
                quittance.getClient() != null ? quittance.getClient().getNom() : null,
                quittance.getContrat() != null ? quittance.getContrat().getNumeroPolice() : null,
                quittance.getContrat() != null ? quittance.getContrat().getBranche() : null,
                montantDu,
                encaissement,
                solde,
                taux
        );
    }
}
