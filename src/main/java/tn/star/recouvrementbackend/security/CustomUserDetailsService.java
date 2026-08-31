package tn.star.recouvrementbackend.security;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import tn.star.recouvrementbackend.entities.Utilisateur;
import tn.star.recouvrementbackend.repository.UtilisateurRepository;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UtilisateurRepository utilisateurRepository;

    public CustomUserDetailsService(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable : " + email));

        return new User(
                utilisateur.getEmail(),
                utilisateur.getMotDePasse(),
                utilisateur.isActif(),
                true, true, true,
                List.of(new SimpleGrantedAuthority("ROLE_" + utilisateur.getRole().name()))
        );
    }
}
