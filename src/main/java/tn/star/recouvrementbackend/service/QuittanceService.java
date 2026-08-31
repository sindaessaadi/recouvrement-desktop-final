package tn.star.recouvrementbackend.service;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.star.recouvrementbackend.dto.QuittanceRequest;
import tn.star.recouvrementbackend.dto.QuittanceResponse;
import tn.star.recouvrementbackend.entities.Branche;
import tn.star.recouvrementbackend.entities.Client;
import tn.star.recouvrementbackend.entities.Contrat;
import tn.star.recouvrementbackend.entities.Memoire;
import tn.star.recouvrementbackend.entities.Quittance;
import tn.star.recouvrementbackend.entities.StatutQuittance;
import tn.star.recouvrementbackend.exception.BusinessRuleException;
import tn.star.recouvrementbackend.exception.ResourceNotFoundException;
import tn.star.recouvrementbackend.repository.ClientRepository;
import tn.star.recouvrementbackend.repository.ContratRepository;
import tn.star.recouvrementbackend.repository.QuittanceRepository;

import java.util.List;

@Service
public class QuittanceService {

    private final QuittanceRepository quittanceRepository;
    private final ClientRepository clientRepository;
    private final ContratRepository contratRepository;
    private final FiscaliteService fiscaliteService;

    public QuittanceService(QuittanceRepository quittanceRepository,
                             ClientRepository clientRepository,
                             ContratRepository contratRepository,
                             FiscaliteService fiscaliteService) {
        this.quittanceRepository = quittanceRepository;
        this.clientRepository = clientRepository;
        this.contratRepository = contratRepository;
        this.fiscaliteService = fiscaliteService;
    }

    @Transactional(readOnly = true)
    public List<QuittanceResponse> getAll() {
        return quittanceRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<QuittanceResponse> getByClient(Long clientId) {
        return quittanceRepository.findByClientId(clientId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public QuittanceResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    public Quittance findEntity(Long id) {
        return quittanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quittance introuvable : " + id));
    }

    @Transactional
    public QuittanceResponse create(QuittanceRequest request) {
        Quittance quittance = new Quittance();
        applyRequest(quittance, request);
        return toResponse(quittanceRepository.save(quittance));
    }

    @Transactional
    public QuittanceResponse update(Long id, QuittanceRequest request) {
        Quittance quittance = findEntity(id);
        applyRequest(quittance, request);
        return toResponse(quittanceRepository.save(quittance));
    }

    @Transactional
    public void delete(Long id) {
        quittanceRepository.delete(findEntity(id));
        quittanceRepository.flush();
    }

    private void applyRequest(Quittance quittance, QuittanceRequest request) {
        if (!request.echeance().isAfter(request.emission())) {
            throw new BusinessRuleException("La date d'échéance doit être postérieure à la date d'émission");
        }

        Client client = clientRepository.findById(request.clientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable : " + request.clientId()));
        Contrat contrat = contratRepository.findById(request.contratId())
                .orElseThrow(() -> new ResourceNotFoundException("Contrat introuvable : " + request.contratId()));

        quittance.setIdentifiant(request.identifiant());
        quittance.setClient(client);
        quittance.setContrat(contrat);
        quittance.setAgence(request.agence());
        quittance.setEmission(request.emission());
        quittance.setEcheance(request.echeance());
        quittance.setMontantNet(request.montant());

        recalculerFiscalite(quittance);
    }

    // Recalcule et persiste frais de police (FPAC), taxe et FGA a partir du montant net et de la
    // branche du contrat, via le point de calcul unique FiscaliteService. Appele a chaque
    // creation/modification pour que les colonnes stockees restent a jour.
    private void recalculerFiscalite(Quittance quittance) {
        Branche branche = quittance.getContrat() != null ? quittance.getContrat().getBranche() : null;
        ResultatFiscal resultat = fiscaliteService.calculer(quittance.getMontantNet(), branche);
        quittance.setFraisPolice(resultat.fraisPolice());
        quittance.setTaxe(resultat.taxe());
        quittance.setFga(resultat.fga());
    }

    // Backfill au demarrage pour les quittances existantes creees avant l'ajout de ces colonnes.
    @PostConstruct
    @Transactional
    public void backfillFiscalite() {
        List<Quittance> aCompleter = quittanceRepository.findAll().stream()
                .filter(q -> q.getFraisPolice() == null || q.getTaxe() == null || q.getFga() == null)
                .toList();
        aCompleter.forEach(this::recalculerFiscalite);
        quittanceRepository.saveAll(aCompleter);
    }

    // Montant total dû sur la quittance (net + frais de police + taxe + FGA), a partir des
    // colonnes persistees.
    public Long getMontantDu(Quittance quittance) {
        return quittance.getMontantNet() + quittance.getFraisPolice() + quittance.getTaxe() + quittance.getFga();
    }

    // Statut calculé : jamais stocké en base (voir CLAUDE.md).
    public StatutQuittance getStatut(Quittance quittance) {
        Memoire memoire = quittance.getMemoire();
        long montantRegle = memoire != null ? memoire.getMontantRegle() : 0L;

        if (montantRegle <= 0) {
            return StatutQuittance.IMPAYE;
        }
        if (montantRegle >= getMontantDu(quittance)) {
            return StatutQuittance.PAYE;
        }
        return StatutQuittance.EN_COURS_DE_PAIEMENT;
    }

    // "montant" cote API (aligne sur le champ Quittance.montant du frontend Angular) ;
    // getMontantNet() cote entite/FiscaliteService conserve la terminologie du barème fiscal.
    public QuittanceResponse toResponse(Quittance quittance) {
        return new QuittanceResponse(
                quittance.getId(),
                quittance.getIdentifiant(),
                quittance.getClient() != null ? quittance.getClient().getId() : null,
                quittance.getClient() != null ? quittance.getClient().getNom() : null,
                quittance.getContrat() != null ? quittance.getContrat().getId() : null,
                quittance.getContrat() != null ? quittance.getContrat().getNumeroPolice() : null,
                quittance.getContrat() != null ? quittance.getContrat().getBranche() : null,
                quittance.getAgence(),
                quittance.getEmission(),
                quittance.getEcheance(),
                quittance.getMontantNet(),
                quittance.getFraisPolice(),
                quittance.getTaxe(),
                quittance.getFga(),
                getMontantDu(quittance),
                getStatut(quittance),
                quittance.isHasMemoire(),
                quittance.getDerniereRelance()
        );
    }
}
