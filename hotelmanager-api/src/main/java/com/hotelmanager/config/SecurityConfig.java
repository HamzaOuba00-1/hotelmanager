package com.hotelmanager.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/uploads/**", "/auth/**", "/", "/index.html", "/swagger-ui/**").permitAll()

                .requestMatchers(HttpMethod.GET, "/hotels/me").hasAnyRole("MANAGER", "EMPLOYE")
                .requestMatchers(HttpMethod.PUT, "/hotels/me").hasRole("MANAGER")

                .requestMatchers(HttpMethod.PATCH, "/api/rooms/*/state").hasAnyRole("MANAGER","EMPLOYE")
                .requestMatchers(HttpMethod.POST, "/api/rooms").hasRole("MANAGER")
                .requestMatchers(HttpMethod.PUT, "/api/rooms/**").hasRole("MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/rooms/**").hasRole("MANAGER")

                .requestMatchers(HttpMethod.POST, "/api/attendance/codes/regenerate").hasRole("MANAGER")
                .requestMatchers(HttpMethod.GET,  "/api/attendance/codes/current").hasAnyRole("MANAGER","EMPLOYE")
                .requestMatchers(HttpMethod.POST, "/api/attendance/check-in").hasAnyRole("MANAGER","EMPLOYE")
                .requestMatchers(HttpMethod.POST, "/api/attendance/check-out").hasAnyRole("MANAGER","EMPLOYE")
                .requestMatchers(HttpMethod.GET,  "/api/attendance").hasRole("MANAGER")
                .requestMatchers(HttpMethod.POST, "/api/attendance/manual").hasRole("MANAGER")
                .requestMatchers(HttpMethod.GET,  "/api/attendance/me").hasAnyRole("MANAGER","EMPLOYE")
                .requestMatchers(HttpMethod.GET,  "/api/attendance/open").hasAnyRole("MANAGER","EMPLOYE")

                .requestMatchers(HttpMethod.POST, "/api/planning").hasRole("MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/planning/**").hasRole("MANAGER")
                .requestMatchers(HttpMethod.GET, "/api/planning/hotel").hasRole("MANAGER")
                .requestMatchers(HttpMethod.GET, "/api/planning/me").hasAnyRole("MANAGER","EMPLOYE")

                // 🔹 Crews
                .requestMatchers(HttpMethod.GET,    "/crews/**").hasRole("MANAGER")
                .requestMatchers(HttpMethod.POST,   "/crews/**").hasRole("MANAGER")
                .requestMatchers(HttpMethod.PUT,    "/crews/**").hasRole("MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/crews/**").hasRole("MANAGER")

                // … dans authorizeHttpRequests(auth -> auth …)
                .requestMatchers(HttpMethod.GET,    "/channels/**").authenticated()
                .requestMatchers(HttpMethod.POST,   "/channels/**").authenticated()
                .requestMatchers(HttpMethod.PUT,    "/channels/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/channels/**").authenticated()
                .requestMatchers(HttpMethod.GET,    "/channels/*/messages/**").authenticated()
                .requestMatchers(HttpMethod.POST,   "/channels/*/messages/**").authenticated()
                // autoriser handshake WS
                .requestMatchers("/ws/**").permitAll()

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // CORS côté MVC (réutilisé par Spring Security via .cors(withDefaults()))
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins("http://localhost:3000")
                    .allowedMethods("*")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
