package tn.star.recouvrementbackend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.star.recouvrementbackend.dto.ContratRequest;
import tn.star.recouvrementbackend.dto.ContratResponse;
import tn.star.recouvrementbackend.dto.VehiculeResponse;
import tn.star.recouvrementbackend.entities.Client;
import tn.star.recouvrementbackend.entities.Contrat;
import tn.star.recouvrementbackend.entities.Vehicule;
import tn.star.recouvrementbackend.exception.BusinessRuleException;
import tn.star.recouvrementbackend.exception.ResourceNotFoundException;
import tn.star.recouvrementbackend.repository.ClientRepository;
import tn.star.recouvrementbackend.repository.ContratRepository;

import java.util.List;

@Service
public class ContratService {

    private final ContratRepository contratRepository;
    private final ClientRepository clientRepository;

    public ContratService(ContratRepository contratRepository, ClientRepository clientRepository) {
        this.contratRepository = contratRepository;
        this.clientRepository = clientRepository;
    }

    @Transactional(readOnly = true)
    public List<ContratResponse> getAll() {
        return contratRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ContratResponse> getByClient(Long clientId) {
        return contratRepository.findByClientId(clientId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ContratResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    public Contrat findEntity(Long id) {
        return contratRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contrat introuvable : " + id));
    }

    @Transactional
    public ContratResponse create(ContratRequest request) {
        Contrat contrat = new Contrat();
        applyRequest(contrat, request);
        return toResponse(contratRepository.save(contrat));
    }

    @Transactional
    public ContratResponse update(Long id, ContratRequest request) {
        Contrat contrat = findEntity(id);
        applyRequest(contrat, request);
        return toResponse(contratRepository.save(contrat));
    }

    @Transactional
    public void delete(Long id) {
        contratRepository.delete(findEntity(id));
        contratRepository.flush();
    }

    private void applyRequest(Contrat contrat, ContratRequest request) {
        if (request.dateEffet() != null && request.dateEcheanceContrat() != null
                && !request.dateEcheanceContrat().isAfter(request.dateEffet())) {
            throw new BusinessRuleException("La date d'échéance du contrat doit être postérieure à la date d'effet");
        }

        Client client = clientRepository.findById(request.clientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable : " + request.clientId()));

        contrat.setNumeroPolice(request.numeroPolice());
        contrat.setClient(client);
        contrat.setBranche(request.branche());
        contrat.setAgence(request.agence());
        contrat.setDateEffet(request.dateEffet());
        contrat.setDateEcheanceContrat(request.dateEcheanceContrat());
        contrat.setPrimeBrute(request.primeBrute());

        if (request.vehicule() == null) {
            contrat.setVehicule(null);
        } else {
            Vehicule vehicule = contrat.getVehicule() != null ? contrat.getVehicule() : new Vehicule();
            vehicule.setImmatriculation(request.vehicule().immatriculation());
            vehicule.setMarque(request.vehicule().marque());
            vehicule.setModele(request.vehicule().modele());
            vehicule.setAnneeMiseEnCirculation(request.vehicule().anneeMiseEnCirculation());
            vehicule.setUsage(request.vehicule().usage());
            vehicule.setContrat(contrat);
            contrat.setVehicule(vehicule);
        }
    }

    public ContratResponse toResponse(Contrat contrat) {
        VehiculeResponse vehiculeResponse = contrat.getVehicule() == null ? null : new VehiculeResponse(
                contrat.getVehicule().getId(),
                contrat.getVehicule().getImmatriculation(),
                contrat.getVehicule().getMarque(),
                contrat.getVehicule().getModele(),
                contrat.getVehicule().getAnneeMiseEnCirculation(),
                contrat.getVehicule().getUsage()
        );

        return new ContratResponse(
                contrat.getId(),
                contrat.getNumeroPolice(),
                contrat.getClient() != null ? contrat.getClient().getId() : null,
                contrat.getClient() != null ? contrat.getClient().getNom() : null,
                contrat.getBranche(),
                contrat.getAgence(),
                contrat.getDateEffet(),
                contrat.getDateEcheanceContrat(),
                contrat.getPrimeBrute(),
                contrat.getPrimeNette(),
                vehiculeResponse
        );
    }
}
