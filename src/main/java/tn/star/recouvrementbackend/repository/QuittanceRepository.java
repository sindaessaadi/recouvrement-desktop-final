package tn.star.recouvrementbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.star.recouvrementbackend.entities.Quittance;

import java.util.List;

public interface QuittanceRepository extends JpaRepository<Quittance, Long> {
    List<Quittance> findByClientId(Long clientId);
}
