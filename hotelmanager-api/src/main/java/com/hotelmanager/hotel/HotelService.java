package com.hotelmanager.hotel;

import com.hotelmanager.hotel.dto.HotelConfigRequest;
import com.hotelmanager.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;
import com.hotelmanager.user.UserRepository;

@Service
@RequiredArgsConstructor
public class HotelService {

    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;

    public Hotel getHotelOf(User manager) {
        // Recharge l'utilisateur depuis la BDD pour avoir un lien hôtel à jour
        var freshUser = userRepository.findById(manager.getId())
                .orElseThrow(() -> new IllegalStateException("Utilisateur introuvable"));

        if (freshUser.getHotel() == null) {
            throw new IllegalStateException("Le manager n'est rattaché à aucun hôtel.");
        }

        return hotelRepository.findById(freshUser.getHotel().getId())
                .orElseThrow(() -> new NoSuchElementException("Hôtel introuvable"));
    }

    

    public Hotel updateHotel(User manager, HotelConfigRequest req) {
        Hotel h = getHotelOf(manager);

        h.setName(req.name());
        h.setAddress(req.address());
        h.setPhone(req.phone());
        h.setEmail(req.email());
        h.setLogoUrl(req.logoUrl());
        h.setLatitude(req.latitude());
        h.setLongitude(req.longitude());

        h.setFloors(req.floors());
        h.setRoomsPerFloor(req.roomsPerFloor());

        h.getFloorLabels().clear();
        if (req.floorLabels() != null) h.getFloorLabels().addAll(req.floorLabels());

        h.getRoomTypes().clear();
        if (req.roomTypes() != null) h.getRoomTypes().addAll(req.roomTypes());

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

        h.setCheckInHour(req.checkInHour());
        h.setCheckOutHour(req.checkOutHour());

        h.getClosedDays().clear();
        if (req.closedDays() != null) h.getClosedDays().addAll(req.closedDays());

        if (req.highSeason() != null) {
            Hotel.Season season = h.getHighSeason() == null ? new Hotel.Season() : h.getHighSeason();
            season.setFromDate(req.highSeason().from());
            season.setToDate(req.highSeason().to());
            h.setHighSeason(season);
        } else {
            h.setHighSeason(null);
        }

        h.setCancellationPolicy(req.cancellationPolicy());
        h.setMinAge(req.minAge());
        h.setPetsAllowed(req.petsAllowed());

        h.getAcceptedPayments().clear();
        if (req.acceptedPayments() != null) h.getAcceptedPayments().addAll(req.acceptedPayments());

        h.setActive(req.active() != null ? req.active() : Boolean.TRUE);
        

        return hotelRepository.save(h);
    }

    public Hotel save(Hotel hotel) {
        return hotelRepository.save(hotel);
    }

}
