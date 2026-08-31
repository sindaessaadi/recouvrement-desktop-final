package tn.star.recouvrementbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.star.recouvrementbackend.entities.Relance;

import java.util.List;

public interface RelanceRepository extends JpaRepository<Relance, Long> {
    List<Relance> findByMemoireId(Long memoireId);
    List<Relance> findAllByOrderByDateHeureDesc();
}
