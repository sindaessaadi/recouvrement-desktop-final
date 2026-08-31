package tn.star.recouvrementbackend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.star.recouvrementbackend.dto.OrganisationRequest;
import tn.star.recouvrementbackend.dto.OrganisationResponse;
import tn.star.recouvrementbackend.entities.Organisation;
import tn.star.recouvrementbackend.repository.OrganisationRepository;

// Organisation = config unique (une seule ligne en base, voir CLAUDE.md).
@Service
public class OrganisationService {

    private final OrganisationRepository organisationRepository;
    private final LogActiviteService logActiviteService;

    public OrganisationService(OrganisationRepository organisationRepository, LogActiviteService logActiviteService) {
        this.organisationRepository = organisationRepository;
        this.logActiviteService = logActiviteService;
    }

    @Transactional
    public OrganisationResponse get() {
        return toResponse(trouverOuCreer());
    }

    @Transactional
    public OrganisationResponse update(OrganisationRequest request) {
        Organisation organisation = trouverOuCreer();
        organisation.setNomCompagnie(request.nomCompagnie());
        organisation.setDevise(request.devise());
        organisation.setPrefixeNumerotationMemoires(request.prefixeNumerotationMemoires());
        organisation.setDelaiRelanceParDefaut(request.delaiRelanceParDefaut());
        organisation.setTauxTva(request.tauxTva());
        organisation.setExerciceComptable(request.exerciceComptable());
        organisation = organisationRepository.save(organisation);
        logActiviteService.enregistrerPourUtilisateurConnecte("Modification des parametres de l'organisation");
        return toResponse(organisation);
    }

    private Organisation trouverOuCreer() {
        return organisationRepository.findAll().stream().findFirst()
                .orElseGet(() -> organisationRepository.save(valeursParDefaut()));
    }

    private Organisation valeursParDefaut() {
        Organisation organisation = new Organisation();
        organisation.setNomCompagnie("STAR Assurances");
        organisation.setDevise("DT");
        organisation.setPrefixeNumerotationMemoires("MEM-");
        organisation.setDelaiRelanceParDefaut(15);
        organisation.setTauxTva(19.0);
        organisation.setExerciceComptable("Janvier - Decembre");
        return organisation;
    }

    private OrganisationResponse toResponse(Organisation organisation) {
        return new OrganisationResponse(
                organisation.getId(),
                organisation.getNomCompagnie(),
                organisation.getDevise(),
                organisation.getPrefixeNumerotationMemoires(),
                organisation.getDelaiRelanceParDefaut(),
                organisation.getTauxTva(),
                organisation.getExerciceComptable()
        );
    }
}
