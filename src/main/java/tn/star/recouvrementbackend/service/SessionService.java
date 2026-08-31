package tn.star.recouvrementbackend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.star.recouvrementbackend.dto.SessionResponse;
import tn.star.recouvrementbackend.entities.Session;
import tn.star.recouvrementbackend.entities.Utilisateur;
import tn.star.recouvrementbackend.exception.BusinessRuleException;
import tn.star.recouvrementbackend.exception.ResourceNotFoundException;
import tn.star.recouvrementbackend.repository.SessionRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SessionService {

    private final SessionRepository sessionRepository;

    public SessionService(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    @Transactional
    public void creerSession(Utilisateur utilisateur, String jti, String userAgent, String adresseIp) {
        Session session = new Session();
        session.setUtilisateur(utilisateur);
        session.setJti(jti);
        session.setAppareil(libelleAppareil(userAgent));
        session.setAdresseIp(adresseIp);
        session.setDateConnexion(LocalDateTime.now());
        session.setDerniereActivite(LocalDateTime.now());
        session.setActif(true);
        sessionRepository.save(session);
    }

    @Transactional(readOnly = true)
    public boolean estActive(String jti) {
        return sessionRepository.findByJti(jti).map(Session::isActif).orElse(false);
    }

    // Best-effort : appele a chaque requete authentifiee, ne doit jamais faire echouer l'authentification.
    @Transactional
    public void majDerniereActivite(String jti) {
        sessionRepository.findByJti(jti).ifPresent(s -> {
            s.setDerniereActivite(LocalDateTime.now());
            sessionRepository.save(s);
        });
    }

    @Transactional
    public void deconnecterParJti(String jti) {
        sessionRepository.findByJti(jti).ifPresent(s -> {
            s.setActif(false);
            sessionRepository.save(s);
        });
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> getSessionsUtilisateur(String email, String jtiActuel) {
        return sessionRepository.findByUtilisateurEmailAndActifTrueOrderByDerniereActiviteDesc(email).stream()
                .map(s -> toResponse(s, jtiActuel))
                .toList();
    }

    @Transactional
    public void deconnecterSession(Long id, String email) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session introuvable : " + id));
        if (session.getUtilisateur() == null || !email.equals(session.getUtilisateur().getEmail())) {
            throw new BusinessRuleException("Cette session n'appartient pas à l'utilisateur connecté");
        }
        session.setActif(false);
        sessionRepository.save(session);
    }

    private SessionResponse toResponse(Session s, String jtiActuel) {
        return new SessionResponse(
                s.getId(),
                s.getAppareil(),
                s.getAdresseIp(),
                s.getDateConnexion(),
                s.getDerniereActivite(),
                s.isActif(),
                s.getJti() != null && s.getJti().equals(jtiActuel)
        );
    }

    private static final Pattern OS_PATTERN = Pattern.compile("Windows|Macintosh|Mac OS X|Linux|Android|iPhone|iPad");

    // Extraction simplifiee OS/navigateur a partir du User-Agent (pas de librairie dediee ajoutee pour si peu).
    private String libelleAppareil(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return "Inconnu";
        }
        String os = "Inconnu";
        Matcher mOs = OS_PATTERN.matcher(userAgent);
        if (mOs.find()) {
            os = switch (mOs.group()) {
                case "Macintosh", "Mac OS X" -> "macOS";
                default -> mOs.group();
            };
        }
        String navigateur = "Inconnu";
        if (userAgent.contains("Edg/")) navigateur = "Edge";
        else if (userAgent.contains("OPR/")) navigateur = "Opera";
        else if (userAgent.contains("Chrome/")) navigateur = "Chrome";
        else if (userAgent.contains("Firefox/")) navigateur = "Firefox";
        else if (userAgent.contains("Safari/")) navigateur = "Safari";

        return os + " - " + navigateur;
    }
}
