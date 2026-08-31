package tn.star.recouvrementbackend.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import tn.star.recouvrementbackend.entities.LogActivite;

import java.util.List;

public interface LogActiviteRepository extends JpaRepository<LogActivite, Long> {
    List<LogActivite> findAllByOrderByDateDesc(Pageable pageable);
}
