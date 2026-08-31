package tn.star.recouvrementbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.star.recouvrementbackend.entities.Paiement;

import java.util.List;

public interface PaiementRepository extends JpaRepository<Paiement, Long> {
    List<Paiement> findByMemoireId(Long memoireId);
}
