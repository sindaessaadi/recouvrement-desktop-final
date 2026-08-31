package tn.star.recouvrementbackend.service;

// Résultat d'un calcul fiscal sur une quittance. Toujours dérivé, jamais stocké en base.
public record ResultatFiscal(
        Long montantNet,
        Long fraisPolice,
        Long assiette,
        Long taxe,
        Long fga,
        Long montantDu
) {
}
