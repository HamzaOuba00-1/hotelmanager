package com.hotelmanager.hotel;

import com.hotelmanager.hotel.dto.HotelConfigRequest;
import com.hotelmanager.hotel.dto.HotelConfigResponse;
import com.hotelmanager.hotel.mapper.HotelManualMapper;
import com.hotelmanager.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;


@RestController
@RequestMapping("/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;
    private final HotelManualMapper mapper;


    @GetMapping("/me")
    @PreAuthorize("hasRole('MANAGER')")
    public HotelConfigResponse getMyHotel(@AuthenticationPrincipal User principal) {
        System.out.println("→ Endpoint /hotels/me appelé par : " + principal.getEmail());
        Hotel h = hotelService.getHotelOf(principal);
        return toResponse(h);
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('MANAGER')")
    public HotelConfigResponse updateMyHotel(@AuthenticationPrincipal User principal,
                                             @Valid @RequestBody HotelConfigRequest req) {
        System.out.println(req);
        Hotel hotel = hotelService.getHotelOf(principal); // récupère
        mapper.updateEntity(hotel, req);                  // met à jour
        Hotel saved = hotelService.save(hotel);           // enregistre
        return mapper.toResponse(saved);
    }

    // ----------------- mapping helper -----------------
    private HotelConfigResponse toResponse(Hotel h) {
        return new HotelConfigResponse(
            h.getId(),
            h.getName(),
            h.getCode(),
            h.getAddress(),
            h.getPhone(),
            h.getEmail(),
            h.getLogoUrl(),
            h.getLatitude(),
            h.getLongitude(),
            h.getFloors(),
            h.getRoomsPerFloor(),
            new ArrayList<>(h.getFloorLabels()),
            new ArrayList<>(h.getRoomTypes()),
            new HotelConfigResponse.ServicesDTO(
                h.getServices() != null ? h.getServices().getHasRestaurant() : null,
                h.getServices() != null ? h.getServices().getHasLaundry() : null,
                h.getServices() != null ? h.getServices().getHasShuttle() : null,
                h.getServices() != null ? h.getServices().getHasGym() : null,
                h.getServices() != null ? h.getServices().getHasPool() : null,
                h.getServices() != null ? h.getServices().getHasBusinessCenter() : null
            ),
            h.getCheckInHour(),
            h.getCheckOutHour(),
            new ArrayList<>(h.getClosedDays()),
            h.getHighSeason() == null ? null :
                new HotelConfigResponse.SeasonDTO(h.getHighSeason().getFromDate(), h.getHighSeason().getToDate()),
            h.getCancellationPolicy(),
            h.getMinAge(),
            h.getPetsAllowed(),
            new ArrayList<>(h.getAcceptedPayments()),
            h.getActive()
        );
    }

    @PostMapping("/me/logo")
    @PreAuthorize("hasRole('MANAGER')")
    public Map<String, String> uploadLogo(@AuthenticationPrincipal User principal,
                                        @RequestParam("file") MultipartFile file) throws IOException {
        // 1. Crée un nom unique
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path uploadsDir = Paths.get("uploads");
        Files.createDirectories(uploadsDir); // si le dossier n’existe pas
        Path path = uploadsDir.resolve(filename);

        // 2. Sauvegarde le fichier
        Files.write(path, file.getBytes());

        // 3. Retourne l’URL accessible publiquement
        String url = "http://localhost:8080/uploads/" + filename;

        // (optionnel) Sauvegarde automatiquement l’URL dans le champ `logoUrl` de l’hôtel du manager :
        Hotel hotel = hotelService.getHotelOf(principal);
        hotel.setLogoUrl(url);
        hotelService.save(hotel);

        return Map.of("logoUrl", url);
    }


    
}
