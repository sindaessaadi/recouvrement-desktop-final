package tn.star.recouvrementbackend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import tn.star.recouvrementbackend.entities.RoleUtilisateur;
import tn.star.recouvrementbackend.entities.Utilisateur;
import tn.star.recouvrementbackend.repository.UtilisateurRepository;

// Cree des comptes de demonstration au premier demarrage si la table utilisateurs est vide
// (aucun utilisateur ne peut se connecter sinon). Mot de passe de dev commun : voir README/chat.
@Component
public class DataSeeder implements CommandLineRunner {

    private static final String MOT_DE_PASSE_DEV = "Star2026!";

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UtilisateurRepository utilisateurRepository, PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (utilisateurRepository.count() > 0) {
            return;
        }

        creerUtilisateur("Fatma Ayari", "f.ayari@star.tn", "22 123 456", RoleUtilisateur.ADMIN);
        creerUtilisateur("Sami Ben Romdhane", "s.benromdhane@star.tn", "20 111 111", RoleUtilisateur.GESTIONNAIRE);
        creerUtilisateur("Nour Chaabane", "n.chaabane@star.tn", "20 222 222", RoleUtilisateur.CONSULTATION);
    }

    private void creerUtilisateur(String nom, String email, String telephone, RoleUtilisateur role) {
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(nom);
        utilisateur.setEmail(email);
        utilisateur.setMotDePasse(passwordEncoder.encode(MOT_DE_PASSE_DEV));
        utilisateur.setRole(role);
        utilisateur.setTelephone(telephone);
        utilisateur.setActif(true);
        utilisateurRepository.save(utilisateur);
    }
}
