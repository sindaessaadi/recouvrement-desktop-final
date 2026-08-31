package tn.star.recouvrementbackend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.star.recouvrementbackend.dto.EcheancierRequest;
import tn.star.recouvrementbackend.dto.EcheancierResponse;
import tn.star.recouvrementbackend.dto.HistoriqueStatutRequest;
import tn.star.recouvrementbackend.dto.HistoriqueStatutResponse;
import tn.star.recouvrementbackend.dto.MemoireRequest;
import tn.star.recouvrementbackend.dto.MemoireResponse;
import tn.star.recouvrementbackend.dto.PaiementResponse;
import tn.star.recouvrementbackend.entities.Client;
import tn.star.recouvrementbackend.entities.Contrat;
import tn.star.recouvrementbackend.entities.Echeancier;
import tn.star.recouvrementbackend.entities.EtapeMemoire;
import tn.star.recouvrementbackend.entities.HistoriqueStatut;
import tn.star.recouvrementbackend.entities.Memoire;
import tn.star.recouvrementbackend.entities.Quittance;
import tn.star.recouvrementbackend.entities.StatutMemoire;
import tn.star.recouvrementbackend.exception.BusinessRuleException;
import tn.star.recouvrementbackend.exception.ResourceNotFoundException;
import tn.star.recouvrementbackend.repository.MemoireRepository;
import tn.star.recouvrementbackend.repository.QuittanceRepository;

import java.util.ArrayList;
import java.util.List;

@Service
public class MemoireService {

    private static final List<Integer> DELAIS_AUTORISES = List.of(15, 30, 45, 60);

    private final MemoireRepository memoireRepository;
    private final QuittanceRepository quittanceRepository;
    private final QuittanceService quittanceService;
    private final FiscaliteService fiscaliteService;
    private final LogActiviteService logActiviteService;

    public MemoireService(MemoireRepository memoireRepository,
                           QuittanceRepository quittanceRepository,
                           QuittanceService quittanceService,
                           FiscaliteService fiscaliteService,
                           LogActiviteService logActiviteService) {
        this.memoireRepository = memoireRepository;
        this.quittanceRepository = quittanceRepository;
        this.quittanceService = quittanceService;
        this.fiscaliteService = fiscaliteService;
        this.logActiviteService = logActiviteService;
    }

    @Transactional(readOnly = true)
    public List<MemoireResponse> getAll() {
        return memoireRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public MemoireResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    public Memoire findEntity(Long id) {
        return memoireRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mémoire introuvable : " + id));
    }

    @Transactional
    public MemoireResponse create(MemoireRequest request) {
        Memoire memoire = new Memoire();
        applyRequest(memoire, request);
        memoire.setStatut(StatutMemoire.EN_ATTENTE);
        memoire.setEtapeActuelle(EtapeMemoire.PLANIFIE);
        // Le numero doit etre unique et sequentiel (champ "Genere", voir CLAUDE.md) : jamais fourni
        // par le client. On sauvegarde une premiere fois pour obtenir l'id auto-genere (IDENTITY),
        // puis on derive le numero de cet id, qui est garanti unique.
        memoire = memoireRepository.save(memoire);
        memoire.setNumero(genererNumero(memoire));
        memoire = memoireRepository.save(memoire);
        logActiviteService.enregistrer(memoire.getAgentTraitant(), "Creation memoire " + memoire.getNumero());
        return toResponse(memoire);
    }

    private String genererNumero(Memoire memoire) {
        int annee = memoire.getDateCreation().getYear();
        return "MEM-" + annee + "-" + String.format("%04d", memoire.getId());
    }

    @Transactional
    public MemoireResponse update(Long id, MemoireRequest request) {
        Memoire memoire = findEntity(id);
        applyRequest(memoire, request);
        return toResponse(memoireRepository.save(memoire));
    }

    @Transactional
    public void delete(Long id) {
        Memoire memoire = findEntity(id);
        if (memoire.getQuittance() != null) {
            memoire.getQuittance().setMemoire(null);
        }
        memoireRepository.delete(memoire);
        memoireRepository.flush();
    }

    @Transactional
    public MemoireResponse setEcheanciers(Long id, List<EcheancierRequest> requests) {
        Memoire memoire = findEntity(id);
        if (memoire.getEcheanciers() == null) {
            memoire.setEcheanciers(new ArrayList<>());
        }
        memoire.getEcheanciers().clear();
        if (requests != null) {
            requests.forEach(r -> {
                Echeancier echeancier = new Echeancier();
                echeancier.setOrdre(r.ordre());
                echeancier.setMontant(r.montant());
                echeancier.setDateEcheance(r.dateEcheance());
                echeancier.setReglee(false);
                echeancier.setMemoire(memoire);
                memoire.getEcheanciers().add(echeancier);
            });
        }
        return toResponse(memoireRepository.save(memoire));
    }

    @Transactional
    public MemoireResponse addHistorique(Long id, HistoriqueStatutRequest request) {
        Memoire memoire = findEntity(id);
        HistoriqueStatut historique = new HistoriqueStatut();
        historique.setEtape(request.etape());
        historique.setCommentaire(request.commentaire());
        historique.setMemoire(memoire);
        if (memoire.getHistorique() == null) {
            memoire.setHistorique(new ArrayList<>());
        }
        memoire.getHistorique().add(historique);
        memoire.setEtapeActuelle(request.etape());
        return toResponse(memoireRepository.save(memoire));
    }

    private void applyRequest(Memoire memoire, MemoireRequest request) {
        if (request.delaiReglement() == null || !DELAIS_AUTORISES.contains(request.delaiReglement())) {
            throw new BusinessRuleException("Le délai de règlement doit être 15, 30, 45 ou 60 jours");
        }

        Quittance quittance = quittanceRepository.findById(request.quittanceId())
                .orElseThrow(() -> new ResourceNotFoundException("Quittance introuvable : " + request.quittanceId()));

        Long memoireActuelId = memoire.getId();
        boolean quittanceDejaCouverte = quittance.getMemoire() != null
                && (memoireActuelId == null || !quittance.getMemoire().getId().equals(memoireActuelId));
        if (quittanceDejaCouverte) {
            throw new BusinessRuleException("Cette quittance est déjà couverte par un mémoire");
        }

        memoire.setQuittance(quittance);
        memoire.setDateCreation(request.dateCreation());
        memoire.setDelaiReglement(request.delaiReglement());
        memoire.setMotif(request.motif());
        memoire.setAgentTraitant(request.agentTraitant());

        if (!isDateCreationValide(memoire)) {
            throw new BusinessRuleException("La date de création du mémoire doit être postérieure ou égale à l'échéance de la quittance");
        }
    }

    // Règle de validation obligatoire : dateCreation >= dateEcheanceQuittance.
    public boolean isDateCreationValide(Memoire memoire) {
        if (memoire.getDateCreation() == null || memoire.getQuittance() == null
                || memoire.getQuittance().getEcheance() == null) {
            return false;
        }
        return !memoire.getDateCreation().isBefore(memoire.getQuittance().getEcheance());
    }

    public Long getMontantDu(Memoire memoire) {
        return quittanceService.getMontantDu(memoire.getQuittance());
    }

    // Reste à payer : jamais stocké en base (voir CLAUDE.md).
    public Long getReste(Memoire memoire) {
        return getMontantDu(memoire) - memoire.getMontantRegle();
    }

    // Recalcule le statut du mémoire à partir des paiements confirmés. Appelé après tout ajout/suppression de paiement.
    @Transactional
    public void recalculerStatut(Memoire memoire) {
        long regle = memoire.getMontantRegle();
        long du = getMontantDu(memoire);

        StatutMemoire nouveauStatut;
        if (regle <= 0) {
            nouveauStatut = StatutMemoire.EN_ATTENTE;
        } else if (regle >= du) {
            nouveauStatut = StatutMemoire.REGLE;
        } else {
            nouveauStatut = StatutMemoire.PARTIEL;
        }
        memoire.setStatut(nouveauStatut);
        memoireRepository.save(memoire);
    }

    public MemoireResponse toResponse(Memoire memoire) {
        List<EcheancierResponse> echeanciers = memoire.getEcheanciers() == null ? List.of()
                : memoire.getEcheanciers().stream()
                    .map(e -> new EcheancierResponse(e.getId(), e.getOrdre(), e.getMontant(), e.getDateEcheance(), e.isReglee()))
                    .toList();

        List<HistoriqueStatutResponse> historique = memoire.getHistorique() == null ? List.of()
                : memoire.getHistorique().stream()
                    .map(h -> new HistoriqueStatutResponse(h.getId(), h.getEtape(), h.getCommentaire()))
                    .toList();

        Quittance quittance = memoire.getQuittance();
        Contrat contrat = quittance != null ? quittance.getContrat() : null;
        Client client = quittance != null ? quittance.getClient() : null;
        ResultatFiscal detailFiscal = quittance == null ? null
                : fiscaliteService.calculer(quittance.getMontantNet(), contrat != null ? contrat.getBranche() : null);

        Long totalDuMemoire = detailFiscal != null ? detailFiscal.montantDu() : null;
        List<PaiementResponse> paiements = memoire.getPaiements() == null ? List.of()
                : memoire.getPaiements().stream()
                    .map(p -> new PaiementResponse(p.getId(), memoire.getId(), memoire.getNumero(),
                            client != null ? client.getNom() : null, p.getMontant(), totalDuMemoire,
                            p.getDatePaiement(), p.getMode(), p.getStatut(), p.getReference()))
                    .toList();

        return new MemoireResponse(
                memoire.getId(),
                memoire.getNumero(),
                quittance != null ? quittance.getId() : null,
                client != null ? client.getNom() : null,
                client != null ? client.getAdresse() : null,
                client != null ? client.getTelephone() : null,
                contrat != null ? contrat.getNumeroPolice() : null,
                contrat != null ? contrat.getBranche() : null,
                quittance != null ? quittance.getEmission() : null,
                quittance != null ? quittance.getEcheance() : null,
                memoire.getDateCreation(),
                memoire.getDelaiReglement(),
                memoire.getDateLimitePaiement(),
                memoire.getMotif(),
                memoire.getAgentTraitant(),
                memoire.getStatut(),
                memoire.getEtapeActuelle(),
                detailFiscal != null ? detailFiscal.montantNet() : null,
                detailFiscal != null ? detailFiscal.fraisPolice() : null,
                detailFiscal != null ? detailFiscal.taxe() + detailFiscal.fga() : null,
                detailFiscal != null ? detailFiscal.montantDu() : null,
                memoire.getMontantRegle(),
                getReste(memoire),
                echeanciers,
                historique,
                paiements
        );
    }
}
