package tn.star.recouvrementbackend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import tn.star.recouvrementbackend.service.SessionService;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final SessionService sessionService;

    public JwtAuthenticationFilter(JwtService jwtService, CustomUserDetailsService userDetailsService,
                                    SessionService sessionService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.sessionService = sessionService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        try {
            String email = jwtService.extraireEmail(token);
            String jti = jwtService.extraireJti(token);
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                // La session (jti) doit rester active cote serveur : un logout ou une revocation manuelle
                // depuis "Sessions actives" invalide immediatement le token, meme s'il n'est pas expire.
                if (jwtService.estValide(token, email) && userDetails.isEnabled() && sessionService.estActive(jti)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    sessionService.majDerniereActivite(jti);
                }
            }
        } catch (Exception e) {
            // Token invalide/expire : on laisse la requete continuer sans authentification,
            // Spring Security la rejettera si l'endpoint le requiert.
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
