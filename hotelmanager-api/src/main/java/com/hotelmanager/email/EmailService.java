package com.hotelmanager.email;

import org.springframework.stereotype.Service;

@Service
public class EmailService {

    public void sendCredentials(String email, String password) {
        System.out.println("Email envoyé à : " + email + " avec le mot de passe : " + password);
        // Tu peux remplacer ça plus tard par du vrai envoi de mail (MailSender, etc.)
    }
}