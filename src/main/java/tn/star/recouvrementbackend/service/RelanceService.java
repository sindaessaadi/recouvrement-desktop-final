package tn.star.recouvrementbackend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.star.recouvrementbackend.dto.RelanceRequest;
import tn.star.recouvrementbackend.dto.RelanceResponse;
import tn.star.recouvrementbackend.entities.Memoire;
import tn.star.recouvrementbackend.entities.Relance;
import tn.star.recouvrementbackend.exception.ResourceNotFoundException;
import tn.star.recouvrementbackend.repository.MemoireRepository;
import tn.star.recouvrementbackend.repository.RelanceRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RelanceService {

    private final RelanceRepository relanceRepository;
    private final MemoireRepository memoireRepository;
    private final LogActiviteService logActiviteService;

    public RelanceService(RelanceRepository relanceRepository, MemoireRepository memoireRepository,
                           LogActiviteService logActiviteService) {
        this.relanceRepository = relanceRepository;
        this.memoireRepository = memoireRepository;
        this.logActiviteService = logActiviteService;
    }

    @Transactional(readOnly = true)
    public List<RelanceResponse> getAll() {
        return relanceRepository.findAllByOrderByDateHeureDesc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public RelanceResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    public Relance findEntity(Long id) {
        return relanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Relance introuvable : " + id));
    }

    @Transactional
    public RelanceResponse create(RelanceRequest request) {
        Memoire memoire = memoireRepository.findById(request.memoireId())
                .orElseThrow(() -> new ResourceNotFoundException("Mémoire introuvable : " + request.memoireId()));

        Relance relance = new Relance();
        relance.setMemoire(memoire);
        relance.setDateHeure(LocalDateTime.now());
        relance.setType(request.type());
        relance.setCanal(request.canal());
        relance.setUtilisateur(request.utilisateur());
        relance.setResultat(request.resultat());
        relance.setMessage(request.message());

        relance = relanceRepository.save(relance);
        logActiviteService.enregistrer(relance.getUtilisateur(),
                "Relance envoyee pour le memoire " + memoire.getNumero());
        return toResponse(relance);
    }

    public RelanceResponse toResponse(Relance relance) {
        Memoire memoire = relance.getMemoire();
        String client = memoire != null && memoire.getQuittance() != null && memoire.getQuittance().getClient() != null
                ? memoire.getQuittance().getClient().getNom()
                : null;

        return new RelanceResponse(
                relance.getId(),
                relance.getDateHeure(),
                memoire != null ? memoire.getId() : null,
                memoire != null ? memoire.getNumero() : null,
                client,
                relance.getType(),
                relance.getCanal(),
                relance.getUtilisateur(),
                relance.getResultat(),
                relance.getMessage()
        );
    }
}
