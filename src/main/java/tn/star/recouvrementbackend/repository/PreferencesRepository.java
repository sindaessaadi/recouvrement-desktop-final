package tn.star.recouvrementbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.star.recouvrementbackend.entities.Preferences;

import java.util.Optional;

public interface PreferencesRepository extends JpaRepository<Preferences, Long> {
    Optional<Preferences> findByUtilisateurEmail(String email);
}
