package tn.star.recouvrementbackend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.star.recouvrementbackend.dto.UtilisateurRequest;
import tn.star.recouvrementbackend.dto.UtilisateurResponse;
import tn.star.recouvrementbackend.entities.Preferences;
import tn.star.recouvrementbackend.entities.Session;
import tn.star.recouvrementbackend.entities.Utilisateur;
import tn.star.recouvrementbackend.exception.BusinessRuleException;
import tn.star.recouvrementbackend.exception.ResourceNotFoundException;
import tn.star.recouvrementbackend.repository.PreferencesRepository;
import tn.star.recouvrementbackend.repository.SessionRepository;
import tn.star.recouvrementbackend.repository.UtilisateurRepository;

import java.util.List;

@Service
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessionRepository sessionRepository;
    private final PreferencesRepository preferencesRepository;
    private final LogActiviteService logActiviteService;

    public UtilisateurService(UtilisateurRepository utilisateurRepository, PasswordEncoder passwordEncoder,
                               SessionRepository sessionRepository, PreferencesRepository preferencesRepository,
                               LogActiviteService logActiviteService) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
        this.sessionRepository = sessionRepository;
        this.preferencesRepository = preferencesRepository;
        this.logActiviteService = logActiviteService;
    }

    @Transactional(readOnly = true)
    public List<UtilisateurResponse> getAll() {
        return utilisateurRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public UtilisateurResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    public Utilisateur findEntity(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable : " + id));
    }

    @Transactional
    public UtilisateurResponse create(UtilisateurRequest request) {
        if (request.motDePasse() == null || request.motDePasse().isBlank()) {
            throw new BusinessRuleException("Le mot de passe est obligatoire à la création");
        }
        if (utilisateurRepository.existsByEmail(request.email())) {
            throw new BusinessRuleException("Un utilisateur avec cet email existe déjà");
        }
        Utilisateur utilisateur = new Utilisateur();
        applyRequest(utilisateur, request);
        return toResponse(utilisateurRepository.save(utilisateur));
    }

    @Transactional
    public UtilisateurResponse update(Long id, UtilisateurRequest request) {
        Utilisateur utilisateur = findEntity(id);
        applyRequest(utilisateur, request);
        return toResponse(utilisateurRepository.save(utilisateur));
    }

    @Transactional
    public void delete(Long id) {
        Utilisateur utilisateur = findEntity(id);
        // Preferences et sessions referencent l'utilisateur par cle etrangere (pas de cascade DB) :
        // a nettoyer explicitement avant la suppression, sinon violation de contrainte.
        List<Session> sessions = sessionRepository.findByUtilisateurEmail(utilisateur.getEmail());
        sessionRepository.deleteAll(sessions);
        preferencesRepository.findByUtilisateurEmail(utilisateur.getEmail()).ifPresent(preferencesRepository::delete);

        String nom = utilisateur.getNom();
        utilisateurRepository.delete(utilisateur);
        utilisateurRepository.flush();
        logActiviteService.enregistrerPourUtilisateurConnecte("Suppression du compte utilisateur " + nom);
    }

    private void applyRequest(Utilisateur utilisateur, UtilisateurRequest request) {
        utilisateur.setNom(request.nom());
        utilisateur.setEmail(request.email());
        utilisateur.setRole(request.role());
        utilisateur.setTelephone(request.telephone());
        utilisateur.setActif(request.actif() == null || request.actif());
        if (request.motDePasse() != null && !request.motDePasse().isBlank()) {
            utilisateur.setMotDePasse(passwordEncoder.encode(request.motDePasse()));
        }
    }

    public UtilisateurResponse toResponse(Utilisateur utilisateur) {
        return new UtilisateurResponse(
                utilisateur.getId(),
                utilisateur.getNom(),
                utilisateur.getEmail(),
                utilisateur.getRole(),
                utilisateur.getTelephone(),
                utilisateur.isActif(),
                utilisateur.getInitiales()
        );
    }
}
