package tn.star.recouvrementbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;
import tn.star.recouvrementbackend.security.CustomUserDetailsService;
import tn.star.recouvrementbackend.security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                           CustomUserDetailsService userDetailsService,
                           CorsConfigurationSource corsConfigurationSource) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // Changer son propre mot de passe / se deconnecter / gerer ses propres sessions et
                        // preferences : ouvert a tout utilisateur authentifie, quel que soit son role
                        // (avant les regles generales POST/PUT/DELETE reservees a ADMIN/GESTIONNAIRE).
                        .requestMatchers(HttpMethod.PUT, "/api/auth/mot-de-passe").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/auth/logout").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/sessions/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/preferences").authenticated()
                        // Gestion des comptes reservee aux administrateurs.
                        .requestMatchers("/api/utilisateurs/**").hasRole("ADMIN")
                        // Consultation (lecture seule) : autorisee a tous les utilisateurs authentifies.
                        .requestMatchers(HttpMethod.GET, "/api/**").authenticated()
                        // Ecriture : reservee a ADMIN et GESTIONNAIRE (CONSULTATION reste lecture seule).
                        .requestMatchers(HttpMethod.POST, "/api/**").hasAnyRole("ADMIN", "GESTIONNAIRE")
                        .requestMatchers(HttpMethod.PUT, "/api/**").hasAnyRole("ADMIN", "GESTIONNAIRE")
                        .requestMatchers(HttpMethod.PATCH, "/api/**").hasAnyRole("ADMIN", "GESTIONNAIRE")
                        .requestMatchers(HttpMethod.DELETE, "/api/**").hasAnyRole("ADMIN", "GESTIONNAIRE")
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
