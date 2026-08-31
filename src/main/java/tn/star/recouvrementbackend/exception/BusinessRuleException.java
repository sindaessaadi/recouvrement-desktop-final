package tn.star.recouvrementbackend.exception;

// Violation d'une règle métier (ex. dateCreation < échéance quittance, quittance déjà couverte par un mémoire).
public class BusinessRuleException extends RuntimeException {
    public BusinessRuleException(String message) {
        super(message);
    }
}
