package tn.star.recouvrementbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.star.recouvrementbackend.entities.Session;

import java.util.List;
import java.util.Optional;

public interface SessionRepository extends JpaRepository<Session, Long> {
    Optional<Session> findByJti(String jti);
    List<Session> findByUtilisateurEmailAndActifTrueOrderByDerniereActiviteDesc(String email);
    List<Session> findByUtilisateurEmail(String email);
}
