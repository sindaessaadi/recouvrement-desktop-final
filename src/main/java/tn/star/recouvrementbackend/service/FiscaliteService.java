package tn.star.recouvrementbackend.service;

import org.springframework.stereotype.Service;
import tn.star.recouvrementbackend.entities.Branche;

// Point unique de calcul des frais/taxes sur une quittance (voir CLAUDE.md - Règles fiscales).
// Ne jamais dupliquer ces formules ailleurs : toujours passer par ce service.
@Service
public class FiscaliteService {

    private static final double TAUX_FRAIS_POLICE = 0.03;
    private static final double TAUX_FGA_AUTO = 0.02;

    public ResultatFiscal calculer(Long montantNet, Branche branche) {
        if (montantNet == null) {
            throw new IllegalArgumentException("montantNet ne peut pas être null");
        }

        long fraisPolice = Math.round(montantNet * TAUX_FRAIS_POLICE);
        long assiette = montantNet + fraisPolice;
        double tauxTUA = tauxTUA(branche);
        long taxe = Math.round(assiette * tauxTUA);
        long fga = branche == Branche.AUTO ? Math.round(montantNet * TAUX_FGA_AUTO) : 0L;
        long montantDu = montantNet + fraisPolice + taxe + fga;

        return new ResultatFiscal(montantNet, fraisPolice, assiette, taxe, fga, montantDu);
    }

    private double tauxTUA(Branche branche) {
        if (branche == null) {
            return 0.12;
        }
        return switch (branche) {
            case AUTO, SANTE, IRDS -> 0.12;
            case TRANSPORT -> 0.05;
            case VIE -> 0.0;
            case AUTRE -> 0.12;
        };
    }
}
