package tn.star.recouvrementbackend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.star.recouvrementbackend.dto.PaiementRequest;
import tn.star.recouvrementbackend.dto.PaiementResponse;
import tn.star.recouvrementbackend.entities.Memoire;
import tn.star.recouvrementbackend.entities.Paiement;
import tn.star.recouvrementbackend.exception.ResourceNotFoundException;
import tn.star.recouvrementbackend.repository.MemoireRepository;
import tn.star.recouvrementbackend.repository.PaiementRepository;

import java.util.ArrayList;
import java.util.List;

@Service
public class PaiementService {

    private final PaiementRepository paiementRepository;
    private final MemoireRepository memoireRepository;
    private final MemoireService memoireService;
    private final LogActiviteService logActiviteService;

    public PaiementService(PaiementRepository paiementRepository,
                            MemoireRepository memoireRepository,
                            MemoireService memoireService,
                            LogActiviteService logActiviteService) {
        this.paiementRepository = paiementRepository;
        this.memoireRepository = memoireRepository;
        this.memoireService = memoireService;
        this.logActiviteService = logActiviteService;
    }

    @Transactional(readOnly = true)
    public List<PaiementResponse> getAll() {
        return paiementRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PaiementResponse> getByMemoire(Long memoireId) {
        return paiementRepository.findByMemoireId(memoireId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PaiementResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    public Paiement findEntity(Long id) {
        return paiementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement introuvable : " + id));
    }

    @Transactional
    public PaiementResponse create(Long memoireId, PaiementRequest request) {
        Memoire memoire = memoireRepository.findById(memoireId)
                .orElseThrow(() -> new ResourceNotFoundException("Mémoire introuvable : " + memoireId));

        Paiement paiement = new Paiement();
        paiement.setMontant(request.montant());
        paiement.setDatePaiement(request.datePaiement());
        paiement.setMode(request.mode());
        paiement.setStatut(request.statut());
        paiement.setReference(request.reference());
        paiement.setMemoire(memoire);
        paiement = paiementRepository.save(paiement);

        // Le mémoire peut déjà avoir sa collection de paiements chargée en mémoire dans cette
        // session : on la met à jour explicitement pour que recalculerStatut voie ce paiement.
        if (memoire.getPaiements() == null) {
            memoire.setPaiements(new ArrayList<>());
        }
        memoire.getPaiements().add(paiement);
        memoireService.recalculerStatut(memoire);
        logActiviteService.enregistrerPourUtilisateurConnecte(
                "Enregistrement paiement pour le memoire " + memoire.getNumero());

        return toResponse(paiement);
    }

    @Transactional
    public void delete(Long id) {
        Paiement paiement = findEntity(id);
        Memoire memoire = paiement.getMemoire();
        if (memoire != null && memoire.getPaiements() != null) {
            memoire.getPaiements().remove(paiement);
        }
        paiementRepository.delete(paiement);
        paiementRepository.flush();
        if (memoire != null) {
            memoireService.recalculerStatut(memoire);
        }
    }

    public PaiementResponse toResponse(Paiement paiement) {
        Memoire memoire = paiement.getMemoire();
        String client = memoire != null && memoire.getQuittance() != null && memoire.getQuittance().getClient() != null
                ? memoire.getQuittance().getClient().getNom()
                : null;

        return new PaiementResponse(
                paiement.getId(),
                memoire != null ? memoire.getId() : null,
                memoire != null ? memoire.getNumero() : null,
                client,
                paiement.getMontant(),
                memoire != null ? memoireService.getMontantDu(memoire) : null,
                paiement.getDatePaiement(),
                paiement.getMode(),
                paiement.getStatut(),
                paiement.getReference()
        );
    }
}
