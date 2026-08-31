package tn.star.recouvrementbackend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.star.recouvrementbackend.dto.AncienneteBucketResponse;
import tn.star.recouvrementbackend.dto.DashboardResponse;
import tn.star.recouvrementbackend.dto.EvolutionMoisResponse;
import tn.star.recouvrementbackend.dto.MemoireRecentResponse;
import tn.star.recouvrementbackend.dto.RepartitionStatutResponse;
import tn.star.recouvrementbackend.entities.Memoire;
import tn.star.recouvrementbackend.entities.Paiement;
import tn.star.recouvrementbackend.entities.Quittance;
import tn.star.recouvrementbackend.entities.StatutMemoire;
import tn.star.recouvrementbackend.entities.StatutPaiement;
import tn.star.recouvrementbackend.repository.MemoireRepository;
import tn.star.recouvrementbackend.repository.PaiementRepository;
import tn.star.recouvrementbackend.repository.QuittanceRepository;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

// Vue agregee pure : aucune donnee stockee ici, tout est recalcule a partir de
// Quittance/Memoire/Paiement a chaque appel (voir CLAUDE.md - Dashboard n'est pas une entite).
@Service
public class DashboardService {

    private static final List<String> LABELS_ANCIENNETE = List.of("0-30 jours", "31-60 jours", "61-90 jours", "> 90 jours");
    private static final int NB_MOIS_EVOLUTION = 6;
    private static final int NB_MEMOIRES_RECENTS = 5;

    private final QuittanceRepository quittanceRepository;
    private final MemoireRepository memoireRepository;
    private final PaiementRepository paiementRepository;
    private final QuittanceService quittanceService;

    public DashboardService(QuittanceRepository quittanceRepository,
                             MemoireRepository memoireRepository,
                             PaiementRepository paiementRepository,
                             QuittanceService quittanceService) {
        this.quittanceRepository = quittanceRepository;
        this.memoireRepository = memoireRepository;
        this.paiementRepository = paiementRepository;
        this.quittanceService = quittanceService;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        List<Quittance> quittances = quittanceRepository.findAll();
        List<Memoire> memoires = memoireRepository.findAll();
        List<Paiement> paiements = paiementRepository.findAll();

        LocalDate debutMois = LocalDate.now().withDayOfMonth(1);

        int memoiresGeneresCeMois = (int) memoires.stream()
                .filter(m -> m.getDateCreation() != null && !m.getDateCreation().isBefore(debutMois))
                .count();

        long creancesEchues = quittances.stream()
                .mapToLong(this::resteSurQuittance)
                .sum();

        long encaissementsCeMois = paiements.stream()
                .filter(p -> p.getStatut() == StatutPaiement.CONFIRME
                        && p.getDatePaiement() != null && !p.getDatePaiement().isBefore(debutMois))
                .mapToLong(Paiement::getMontant)
                .sum();

        long montantDuTotal = quittances.stream().mapToLong(quittanceService::getMontantDu).sum();
        long montantRegleTotal = memoires.stream().mapToLong(Memoire::getMontantRegle).sum();
        int tauxRecouvrementCeMois = montantDuTotal > 0 ? (int) Math.round(montantRegleTotal * 100.0 / montantDuTotal) : 0;

        return new DashboardResponse(
                memoiresGeneresCeMois,
                creancesEchues,
                encaissementsCeMois,
                tauxRecouvrementCeMois,
                calculerAnciennete(quittances),
                calculerEvolution(quittances, paiements),
                calculerMemoiresRecents(memoires),
                calculerRepartitionStatut(memoires)
        );
    }

    private long resteSurQuittance(Quittance quittance) {
        long montantDu = quittanceService.getMontantDu(quittance);
        long montantRegle = quittance.getMemoire() != null ? quittance.getMemoire().getMontantRegle() : 0L;
        return Math.max(0L, montantDu - montantRegle);
    }

    private List<AncienneteBucketResponse> calculerAnciennete(List<Quittance> quittances) {
        long[] sommeParBucket = new long[4];
        LocalDate aujourdHui = LocalDate.now();

        for (Quittance quittance : quittances) {
            long reste = resteSurQuittance(quittance);
            if (reste <= 0 || quittance.getEcheance() == null) {
                continue;
            }
            long jours = ChronoUnit.DAYS.between(quittance.getEcheance(), aujourdHui);
            int bucket = jours <= 30 ? 0 : jours <= 60 ? 1 : jours <= 90 ? 2 : 3;
            sommeParBucket[bucket] += reste;
        }

        long total = sommeParBucket[0] + sommeParBucket[1] + sommeParBucket[2] + sommeParBucket[3];
        List<AncienneteBucketResponse> resultat = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            int pourcentage = total > 0 ? (int) Math.round(sommeParBucket[i] * 100.0 / total) : 0;
            resultat.add(new AncienneteBucketResponse(LABELS_ANCIENNETE.get(i), pourcentage));
        }
        return resultat;
    }

    private List<EvolutionMoisResponse> calculerEvolution(List<Quittance> quittances, List<Paiement> paiements) {
        YearMonth moisCourant = YearMonth.now();
        List<EvolutionMoisResponse> resultat = new ArrayList<>();

        for (int i = NB_MOIS_EVOLUTION - 1; i >= 0; i--) {
            YearMonth mois = moisCourant.minusMonths(i);

            long attente = quittances.stream()
                    .filter(q -> q.getEmission() != null && YearMonth.from(q.getEmission()).equals(mois))
                    .mapToLong(quittanceService::getMontantDu)
                    .sum();

            long recupere = paiements.stream()
                    .filter(p -> p.getStatut() == StatutPaiement.CONFIRME
                            && p.getDatePaiement() != null && YearMonth.from(p.getDatePaiement()).equals(mois))
                    .mapToLong(Paiement::getMontant)
                    .sum();

            String libelleMois = capitalise(mois.getMonth().getDisplayName(TextStyle.SHORT, Locale.FRENCH));
            resultat.add(new EvolutionMoisResponse(libelleMois, attente, recupere));
        }
        return resultat;
    }

    private String capitalise(String s) {
        return s.isEmpty() ? s : Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    private List<MemoireRecentResponse> calculerMemoiresRecents(List<Memoire> memoires) {
        return memoires.stream()
                .filter(m -> m.getDateCreation() != null)
                .sorted(Comparator.comparing(Memoire::getDateCreation).reversed())
                .limit(NB_MEMOIRES_RECENTS)
                .map(m -> new MemoireRecentResponse(
                        m.getNumero(),
                        m.getQuittance() != null && m.getQuittance().getClient() != null
                                ? m.getQuittance().getClient().getNom() : null,
                        m.getDateCreation(),
                        quittanceService.getMontantDu(m.getQuittance()),
                        m.getStatut()
                ))
                .toList();
    }

    private List<RepartitionStatutResponse> calculerRepartitionStatut(List<Memoire> memoires) {
        int total = memoires.size();
        Map<StatutMemoire, Long> comptes = memoires.stream()
                .collect(Collectors.groupingBy(Memoire::getStatut, Collectors.counting()));

        List<RepartitionStatutResponse> resultat = new ArrayList<>();
        for (StatutMemoire statut : StatutMemoire.values()) {
            int nombre = comptes.getOrDefault(statut, 0L).intValue();
            int pourcentage = total > 0 ? (int) Math.round(nombre * 100.0 / total) : 0;
            resultat.add(new RepartitionStatutResponse(statut.name(), nombre, pourcentage));
        }
        return resultat;
    }
}
