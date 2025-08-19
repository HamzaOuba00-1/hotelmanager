package com.hotelmanager.config;

import com.hotelmanager.user.User;
import com.hotelmanager.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;                // ton util existant
    private final UserRepository userRepository;  // ✅ on charge l'utilisateur + hôtel depuis la DB

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/auth"); // Ne filtre pas /auth/*
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);
        final String email = jwtUtil.extractUsername(token);

        // Ne pas réauthentifier si déjà authentifié dans le contexte
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // ✅ charge l'utilisateur AVEC son hôtel (fetch join / EntityGraph)
            var userOpt = userRepository.findOneWithHotelByEmail(email);

            if (userOpt.isPresent()) {
                User user = userOpt.get();

                // Ton JwtUtil doit valider le token par rapport au User (il implémente UserDetails)
                if (jwtUtil.isTokenValid(token, user)) {
                    var authToken = new UsernamePasswordAuthenticationToken(
                            user, // ✅ principal = entité User complète (avec hotel)
                            null,
                            user.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
