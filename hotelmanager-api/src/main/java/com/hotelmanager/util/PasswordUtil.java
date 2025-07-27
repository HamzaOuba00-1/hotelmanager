package com.hotelmanager.util;

import java.security.SecureRandom;

public class PasswordUtil {

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#&*!?";
    private static final SecureRandom random = new SecureRandom();

    /**
     * Génère un mot de passe aléatoire sécurisé
     *
     * @param length longueur souhaitée
     * @return mot de passe généré
     */
    public static String generateSecurePassword(int length) {
        if (length < 6) {
            throw new IllegalArgumentException("Le mot de passe doit contenir au moins 6 caractères");
        }

        StringBuilder password = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            password.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return password.toString();
    }
}