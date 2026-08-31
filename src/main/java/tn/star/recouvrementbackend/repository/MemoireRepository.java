package tn.star.recouvrementbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.star.recouvrementbackend.entities.Memoire;

public interface MemoireRepository extends JpaRepository<Memoire, Long> {
}
