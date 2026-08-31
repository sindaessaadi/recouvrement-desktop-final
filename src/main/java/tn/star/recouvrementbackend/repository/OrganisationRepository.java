package tn.star.recouvrementbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.star.recouvrementbackend.entities.Organisation;

public interface OrganisationRepository extends JpaRepository<Organisation, Long> {
}
