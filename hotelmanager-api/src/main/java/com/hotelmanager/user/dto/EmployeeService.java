package com.hotelmanager.user.dto;

import com.hotelmanager.user.dto.EmployeeRequest;
import com.hotelmanager.user.User;
import com.hotelmanager.user.Role;
import com.hotelmanager.user.UserRepository;
import com.hotelmanager.email.EmailService;
import com.hotelmanager.util.PasswordUtil;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmployeeService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final EmailService emailService;

    // Remplacement de @RequiredArgsConstructor
    public EmployeeService(UserRepository userRepo,
                           PasswordEncoder encoder,
                           EmailService emailService) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.emailService = emailService;
    }

    @Transactional
    public User create(EmployeeRequest dto, User manager) {
        // Génération mot de passe sécurisé aléatoire
        String rawPwd = PasswordUtil.generateSecurePassword(12);

        // Création de l’employé lié à l’hôtel du manager
        User employee = new User();
        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setEmail(dto.getEmail());
        employee.setPassword(encoder.encode(rawPwd));
        employee.setRole(Role.EMPLOYE);
        employee.setHotel(manager.getHotel());
        employee.setEnabled(true);

        // Sauvegarde en base
        userRepo.save(employee);

        // Envoi des identifiants par email
        emailService.sendCredentials(dto.getEmail(), rawPwd);

        return employee;
    }
}
