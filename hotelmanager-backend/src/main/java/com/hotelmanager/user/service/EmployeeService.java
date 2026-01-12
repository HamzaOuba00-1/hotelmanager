package com.hotelmanager.user.service;

import com.hotelmanager.user.dto.EmployeeRequest;
import com.hotelmanager.user.entity.Role;
import com.hotelmanager.user.entity.User;
import com.hotelmanager.user.repository.UserRepository;
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

    public EmployeeService(UserRepository userRepo,
                           PasswordEncoder encoder,
                           EmailService emailService) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.emailService = emailService;
    }

    @Transactional
    public User create(EmployeeRequest dto, User manager) {
        String rawPwd = PasswordUtil.generateSecurePassword(12);

        User employee = new User();
        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setEmail(dto.getEmail());
        employee.setPassword(encoder.encode(rawPwd));
        employee.setRole(Role.EMPLOYE);
        employee.setHotel(manager.getHotel());
        employee.setEnabled(true);

        userRepo.save(employee);

        emailService.sendCredentials(dto.getEmail(), rawPwd);

        return employee;
    }
}
