package tn.star.recouvrementbackend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tn.star.recouvrementbackend.entities.Utilisateur;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;
import java.util.function.Function;

@Service
public class JwtService {

    private final SecretKey cle;
    private final long dureeValiditeMs;

    public JwtService(@Value("${jwt.secret}") String secret, @Value("${jwt.expiration-ms}") long dureeValiditeMs) {
        this.cle = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.dureeValiditeMs = dureeValiditeMs;
    }

    // jti genere ici (pas cote appelant) : identifiant unique de la session, utilise pour pouvoir
    // la retrouver et la revoquer independamment de l'expiration du token lui-meme.
    public String genererJti() {
        return UUID.randomUUID().toString();
    }

    public String genererToken(Utilisateur utilisateur, String jti) {
        Date maintenant = new Date();
        Date expiration = new Date(maintenant.getTime() + dureeValiditeMs);
        return Jwts.builder()
                .subject(utilisateur.getEmail())
                .id(jti)
                .claim("role", utilisateur.getRole().name())
                .claim("nom", utilisateur.getNom())
                .issuedAt(maintenant)
                .expiration(expiration)
                .signWith(cle)
                .compact();
    }

    public String extraireEmail(String token) {
        return extraireClaim(token, Claims::getSubject);
    }

    public String extraireJti(String token) {
        return extraireClaim(token, Claims::getId);
    }

    public boolean estValide(String token, String email) {
        String emailToken = extraireEmail(token);
        return emailToken.equals(email) && !estExpire(token);
    }

    private boolean estExpire(String token) {
        return extraireClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extraireClaim(String token, Function<Claims, T> resolver) {
        Claims claims = Jwts.parser().verifyWith(cle).build().parseSignedClaims(token).getPayload();
        return resolver.apply(claims);
    }
}
