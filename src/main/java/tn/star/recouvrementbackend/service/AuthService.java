package tn.star.recouvrementbackend.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.star.recouvrementbackend.dto.ChangerMotDePasseRequest;
import tn.star.recouvrementbackend.dto.LoginRequest;
import tn.star.recouvrementbackend.dto.LoginResponse;
import tn.star.recouvrementbackend.dto.UtilisateurResponse;
import tn.star.recouvrementbackend.entities.Utilisateur;
import tn.star.recouvrementbackend.exception.BusinessRuleException;
import tn.star.recouvrementbackend.exception.ResourceNotFoundException;
import tn.star.recouvrementbackend.repository.UtilisateurRepository;
import tn.star.recouvrementbackend.security.JwtService;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UtilisateurRepository utilisateurRepository;
    private final UtilisateurService utilisateurService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final SessionService sessionService;
    private final LogActiviteService logActiviteService;

    public AuthService(AuthenticationManager authenticationManager,
                        UtilisateurRepository utilisateurRepository,
                        UtilisateurService utilisateurService,
                        JwtService jwtService,
                        PasswordEncoder passwordEncoder,
                        SessionService sessionService,
                        LogActiviteService logActiviteService) {
        this.authenticationManager = authenticationManager;
        this.utilisateurRepository = utilisateurRepository;
        this.utilisateurService = utilisateurService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.sessionService = sessionService;
        this.logActiviteService = logActiviteService;
    }

    public LoginResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.motDePasse())
            );
        } catch (AuthenticationException e) {
            throw new BusinessRuleException("Email ou mot de passe incorrect");
        }

        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessRuleException("Email ou mot de passe incorrect"));

        String jti = jwtService.genererJti();
        String token = jwtService.genererToken(utilisateur, jti);
        sessionService.creerSession(utilisateur, jti, httpRequest.getHeader("User-Agent"), httpRequest.getRemoteAddr());
        logActiviteService.enregistrer(utilisateur.getNom(), "Connexion au systeme");

        return new LoginResponse(token, utilisateurService.toResponse(utilisateur));
    }

    public void logout(HttpServletRequest httpRequest) {
        String header = httpRequest.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            sessionService.deconnecterParJti(jwtService.extraireJti(header.substring(7)));
        }
    }

    public UtilisateurResponse getUtilisateurConnecte(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable : " + email));
        return utilisateurService.toResponse(utilisateur);
    }

    @Transactional
    public void changerMotDePasse(String email, ChangerMotDePasseRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable : " + email));

        if (!passwordEncoder.matches(request.ancien(), utilisateur.getMotDePasse())) {
            throw new BusinessRuleException("L'ancien mot de passe est incorrect");
        }

        utilisateur.setMotDePasse(passwordEncoder.encode(request.nouveau()));
        utilisateurRepository.save(utilisateur);
        logActiviteService.enregistrer(utilisateur.getNom(), "Modification du mot de passe");
    }
}
