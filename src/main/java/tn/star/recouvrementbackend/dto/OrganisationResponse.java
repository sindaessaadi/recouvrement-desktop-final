package tn.star.recouvrementbackend.dto;

public record OrganisationResponse(
        Long id,
        String nomCompagnie,
        String devise,
        String prefixeNumerotationMemoires,
        Integer delaiRelanceParDefaut,
        Double tauxTva,
        String exerciceComptable
) {
}
