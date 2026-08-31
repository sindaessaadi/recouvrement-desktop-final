package tn.star.recouvrementbackend.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.star.recouvrementbackend.dto.LogActiviteResponse;
import tn.star.recouvrementbackend.entities.LogActivite;
import tn.star.recouvrementbackend.repository.LogActiviteRepository;
import tn.star.recouvrementbackend.repository.UtilisateurRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LogActiviteService {

    private static final int LIMITE = 200;

    private final LogActiviteRepository logActiviteRepository;
    private final UtilisateurRepository utilisateurRepository;

    public LogActiviteService(LogActiviteRepository logActiviteRepository, UtilisateurRepository utilisateurRepository) {
        this.logActiviteRepository = logActiviteRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    // Ne doit jamais faire echouer l'action qu'elle journalise : appelee en best-effort depuis les
    // autres services, apres l'operation metier elle-meme.
    @Transactional
    public void enregistrer(String utilisateur, String action) {
        LogActivite log = new LogActivite();
        log.setDate(LocalDateTime.now());
        log.setUtilisateur(utilisateur);
        log.setAction(action);
        logActiviteRepository.save(log);
    }

    // Resout le nom de l'utilisateur actuellement authentifie (via le contexte de securite de la
    // requete en cours) plutot que de devoir le faire transiter dans chaque DTO de requete.
    @Transactional
    public void enregistrerPourUtilisateurConnecte(String action) {
        String email = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : null;
        String nom = email != null
                ? utilisateurRepository.findByEmail(email).map(u -> u.getNom()).orElse(email)
                : "Systeme";
        enregistrer(nom, action);
    }

    @Transactional(readOnly = true)
    public List<LogActiviteResponse> getAll() {
        return logActiviteRepository.findAllByOrderByDateDesc(PageRequest.of(0, LIMITE)).stream()
                .map(l -> new LogActiviteResponse(l.getId(), l.getDate(), l.getUtilisateur(), l.getAction()))
                .toList();
    }
}
