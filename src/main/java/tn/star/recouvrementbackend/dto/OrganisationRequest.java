package tn.star.recouvrementbackend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record OrganisationRequest(
        @NotBlank String nomCompagnie,
        @NotBlank String devise,
        @NotBlank String prefixeNumerotationMemoires,
        @NotNull @Positive Integer delaiRelanceParDefaut,
        @NotNull @DecimalMin("0.0") @DecimalMax("100.0") Double tauxTva,
        @NotBlank String exerciceComptable
) {
}
