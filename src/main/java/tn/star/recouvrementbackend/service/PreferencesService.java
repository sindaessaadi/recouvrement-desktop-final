package tn.star.recouvrementbackend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.star.recouvrementbackend.dto.PreferencesRequest;
import tn.star.recouvrementbackend.dto.PreferencesResponse;
import tn.star.recouvrementbackend.entities.Preferences;
import tn.star.recouvrementbackend.entities.Utilisateur;
import tn.star.recouvrementbackend.exception.ResourceNotFoundException;
import tn.star.recouvrementbackend.repository.PreferencesRepository;
import tn.star.recouvrementbackend.repository.UtilisateurRepository;

@Service
public class PreferencesService {

    private final PreferencesRepository preferencesRepository;
    private final UtilisateurRepository utilisateurRepository;

    public PreferencesService(PreferencesRepository preferencesRepository, UtilisateurRepository utilisateurRepository) {
        this.preferencesRepository = preferencesRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    @Transactional
    public PreferencesResponse getPourUtilisateur(String email) {
        return toResponse(trouverOuCreer(email));
    }

    @Transactional
    public PreferencesResponse mettreAJour(String email, PreferencesRequest request) {
        Preferences preferences = trouverOuCreer(email);
        preferences.setNotificationsEmail(request.notificationsEmail());
        preferences.setNotificationsApp(request.notificationsApp());
        preferences.setAlerteRelanceEchue(request.alerteRelanceEchue());
        preferences.setAlerteImpaye(request.alerteImpaye());
        preferences.setSeuilAlerteImpaye(request.seuilAlerteImpaye());
        preferences.setTheme(request.theme());
        preferences.setLangue(request.langue());
        preferences.setDensite(request.densite());
        preferences.setFormatDate(request.formatDate());
        return toResponse(preferencesRepository.save(preferences));
    }

    // Get-or-create : chaque utilisateur a des preferences par defaut des sa premiere consultation,
    // pas besoin d'une etape de creation explicite (meme principe que Organisation, en singleton par utilisateur).
    private Preferences trouverOuCreer(String email) {
        return preferencesRepository.findByUtilisateurEmail(email).orElseGet(() -> {
            Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable : " + email));
            Preferences preferences = new Preferences();
            preferences.setUtilisateur(utilisateur);
            return preferencesRepository.save(preferences);
        });
    }

    private PreferencesResponse toResponse(Preferences p) {
        return new PreferencesResponse(
                p.isNotificationsEmail(),
                p.isNotificationsApp(),
                p.isAlerteRelanceEchue(),
                p.isAlerteImpaye(),
                p.getSeuilAlerteImpaye(),
                p.getTheme(),
                p.getLangue(),
                p.getDensite(),
                p.getFormatDate()
        );
    }
}
