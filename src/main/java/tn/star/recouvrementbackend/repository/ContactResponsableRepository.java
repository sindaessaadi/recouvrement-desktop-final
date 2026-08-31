package tn.star.recouvrementbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.star.recouvrementbackend.entities.ContactResponsable;

import java.util.List;

public interface ContactResponsableRepository extends JpaRepository<ContactResponsable, Long> {
    List<ContactResponsable> findByClientId(Long clientId);
}
