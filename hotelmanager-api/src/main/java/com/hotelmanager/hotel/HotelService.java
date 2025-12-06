package com.hotelmanager.hotel;

import com.hotelmanager.hotel.dto.HotelConfigRequest;
import com.hotelmanager.room.RoomService;
import com.hotelmanager.user.User;
import com.hotelmanager.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class HotelService {

    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final RoomService roomService;

    public Hotel getHotelOf(User manager) {
        var freshUser = userRepository.findById(manager.getId())
                .orElseThrow(() -> new IllegalStateException("Utilisateur introuvable"));

        if (freshUser.getHotel() == null) {
            throw new IllegalStateException("Le manager n'est rattaché à aucun hôtel.");
        }

        return hotelRepository.findById(freshUser.getHotel().getId())
                .orElseThrow(() -> new NoSuchElementException("Hôtel introuvable"));
    }

    public Hotel updateHotel(User manager, HotelConfigRequest req, boolean forceRegen) {
        Hotel h = getHotelOf(manager);

        // ---- Ensure lists not null (VERY IMPORTANT) ----
        ensureCollections(h);

        // ---- Snapshot ancienne structure ----
        Integer oldFloors = h.getFloors();
        Integer oldRoomsPerFloor = h.getRoomsPerFloor();
        List<String> oldFloorLabels = new ArrayList<>(safeList(h.getFloorLabels()));
        List<String> oldRoomTypes   = new ArrayList<>(safeList(h.getRoomTypes()));

        // ---- Infos générales ----
        h.setName(req.name());
        h.setAddress(req.address());
        h.setPhone(req.phone());
        h.setEmail(req.email());
        h.setLogoUrl(req.logoUrl());
        h.setLatitude(req.latitude());
        h.setLongitude(req.longitude());

        // ---- Structure ----
        h.setFloors(req.floors());
        h.setRoomsPerFloor(req.roomsPerFloor());

        // Floor labels
        h.getFloorLabels().clear();
        if (req.floorLabels() != null) {
            h.getFloorLabels().addAll(req.floorLabels());
        }

        // Room types
        h.getRoomTypes().clear();
        if (req.roomTypes() != null) {
            h.getRoomTypes().addAll(req.roomTypes());
        }

        // ---- Services ----
        if (req.services() != null) {
            Hotel.Services s = h.getServices() == null ? new Hotel.Services() : h.getServices();
            s.setHasRestaurant(Boolean.TRUE.equals(req.services().hasRestaurant()));
            s.setHasLaundry(Boolean.TRUE.equals(req.services().hasLaundry()));
            s.setHasShuttle(Boolean.TRUE.equals(req.services().hasShuttle()));
            s.setHasGym(Boolean.TRUE.equals(req.services().hasGym()));
            s.setHasPool(Boolean.TRUE.equals(req.services().hasPool()));
            s.setHasBusinessCenter(Boolean.TRUE.equals(req.services().hasBusinessCenter()));
            h.setServices(s);
        }

        // ---- Horaires ----
        h.setCheckInHour(req.checkInHour());
        h.setCheckOutHour(req.checkOutHour());

        // ---- Jours fermés ----
        h.getClosedDays().clear();
        if (req.closedDays() != null) {
            h.getClosedDays().addAll(req.closedDays());
        }

        // ---- Saison haute ----
        if (req.highSeason() != null) {
            Hotel.Season season = h.getHighSeason() == null ? new Hotel.Season() : h.getHighSeason();
            season.setFromDate(req.highSeason().from());
            season.setToDate(req.highSeason().to());
            h.setHighSeason(season);
        } else {
            h.setHighSeason(null);
        }

        // ---- Politique ----
        h.setCancellationPolicy(req.cancellationPolicy());
        h.setMinAge(req.minAge());
        h.setPetsAllowed(req.petsAllowed());

        // ---- Paiements ----
        h.getAcceptedPayments().clear();
        if (req.acceptedPayments() != null) {
            h.getAcceptedPayments().addAll(req.acceptedPayments());
        }

        // ---- Statut ----
        h.setActive(req.active() != null ? req.active() : Boolean.TRUE);

        Hotel saved = hotelRepository.save(h);

        // ---- Compare structure safely ----
        boolean structureChanged = structureChanged(
                oldFloors, oldRoomsPerFloor, oldFloorLabels, oldRoomTypes, req
        );

        if (structureChanged || forceRegen) {
            try {
                roomService.generateRoomsForHotel(saved);
            } catch (Exception e) {
                System.err.println("⚠ Erreur lors de la génération automatique des chambres : " + e.getMessage());
            }
        }

        return saved;
    }

    public Hotel save(Hotel hotel) {
        ensureCollections(hotel);
        return hotelRepository.save(hotel);
    }

    // -------------------- Helpers --------------------

    private static List<String> safeList(List<String> l) {
        return l == null ? List.of() : l;
    }

    private static boolean structureChanged(
            Integer oldFloors,
            Integer oldRoomsPerFloor,
            List<String> oldFloorLabels,
            List<String> oldRoomTypes,
            HotelConfigRequest req
    ) {
        List<String> newFloorLabels = req.floorLabels() == null ? List.of() : req.floorLabels();
        List<String> newRoomTypes   = req.roomTypes() == null ? List.of() : req.roomTypes();

        return !Objects.equals(oldFloors, req.floors())
                || !Objects.equals(oldRoomsPerFloor, req.roomsPerFloor())
                || !Objects.equals(oldFloorLabels, newFloorLabels)
                || !Objects.equals(oldRoomTypes, newRoomTypes);
    }

    /**
     * Si dans ton entity Hotel tu n’as pas initialisé les listes
     * (ex: private List<String> floorLabels = new ArrayList<>();),
     * alors il faut les garantir ici.
     */
    private static void ensureCollections(Hotel h) {
        if (h.getFloorLabels() == null) {
            h.setFloorLabels(new ArrayList<>());
        }
        if (h.getRoomTypes() == null) {
            h.setRoomTypes(new ArrayList<>());
        }
        if (h.getClosedDays() == null) {
            h.setClosedDays(new ArrayList<>());
        }
        if (h.getAcceptedPayments() == null) {
            h.setAcceptedPayments(new ArrayList<>());
        }
    }
}
