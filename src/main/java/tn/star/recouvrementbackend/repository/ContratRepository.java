package tn.star.recouvrementbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.star.recouvrementbackend.entities.Contrat;

import java.util.List;

public interface ContratRepository extends JpaRepository<Contrat, Long> {
    List<Contrat> findByClientId(Long clientId);
}
