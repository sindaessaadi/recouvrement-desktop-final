package tn.star.recouvrementbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.star.recouvrementbackend.entities.Client;

public interface ClientRepository extends JpaRepository<Client, Long> {
}
