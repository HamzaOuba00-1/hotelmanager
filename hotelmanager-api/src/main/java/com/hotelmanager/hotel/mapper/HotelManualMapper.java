package com.hotelmanager.hotel.mapper;

import com.hotelmanager.hotel.Hotel;
import com.hotelmanager.hotel.dto.HotelConfigRequest;
import com.hotelmanager.hotel.dto.HotelConfigResponse;
import org.springframework.stereotype.Component;
import java.util.ArrayList;

@Component
public class HotelManualMapper {
    public HotelConfigResponse toResponse(Hotel h) {
        return new HotelConfigResponse(
                h.getId(), h.getName(), h.getCode(), h.getAddress(), h.getPhone(), h.getEmail(), h.getLogoUrl(),
                h.getLatitude(), h.getLongitude(), h.getFloors(), h.getRoomsPerFloor(),
                new ArrayList<>(h.getFloorLabels()), new ArrayList<>(h.getRoomTypes()),
                new HotelConfigResponse.ServicesDTO(
                        h.getServices() != null ? h.getServices().getHasRestaurant() : null,
                        h.getServices() != null ? h.getServices().getHasLaundry() : null,
                        h.getServices() != null ? h.getServices().getHasShuttle() : null,
                        h.getServices() != null ? h.getServices().getHasGym() : null,
                        h.getServices() != null ? h.getServices().getHasPool() : null,
                        h.getServices() != null ? h.getServices().getHasBusinessCenter() : null),
                h.getCheckInHour(), h.getCheckOutHour(), new ArrayList<>(h.getClosedDays()),
                h.getHighSeason() == null ? null
                        : new HotelConfigResponse.SeasonDTO(
                                h.getHighSeason().getFromDate(), h.getHighSeason().getToDate()),
                h.getCancellationPolicy(), h.getMinAge(), h.getPetsAllowed(),
                new ArrayList<>(h.getAcceptedPayments()), h.getActive());
    }

    public void updateEntity(Hotel h, HotelConfigRequest req) {
        if (req.name() != null && !req.name().isBlank()) {
            h.setName(req.name());
        }
        if (req.address() != null)
            h.setAddress(req.address());
        if (req.phone() != null)
            h.setPhone(req.phone());
        if (req.email() != null)
            h.setEmail(req.email());
        if (req.logoUrl() != null)
            h.setLogoUrl(req.logoUrl());
        if (req.latitude() != null)
            h.setLatitude(req.latitude());
        if (req.longitude() != null)
            h.setLongitude(req.longitude());

        if (req.floors() != null)
            h.setFloors(req.floors());
        if (req.roomsPerFloor() != null)
            h.setRoomsPerFloor(req.roomsPerFloor());

        if (req.floorLabels() != null) {
            h.getFloorLabels().clear();
            h.getFloorLabels().addAll(req.floorLabels());
        }

        if (req.roomTypes() != null) {
            h.getRoomTypes().clear();
            h.getRoomTypes().addAll(req.roomTypes());
        }

        if (req.services() != null) {
            var s = h.getServices() == null ? new Hotel.Services() : h.getServices();
            if (req.services().hasRestaurant() != null)
                s.setHasRestaurant(req.services().hasRestaurant());
            if (req.services().hasLaundry() != null)
                s.setHasLaundry(req.services().hasLaundry());
            if (req.services().hasShuttle() != null)
                s.setHasShuttle(req.services().hasShuttle());
            if (req.services().hasGym() != null)
                s.setHasGym(req.services().hasGym());
            if (req.services().hasPool() != null)
                s.setHasPool(req.services().hasPool());
            if (req.services().hasBusinessCenter() != null)
                s.setHasBusinessCenter(req.services().hasBusinessCenter());
            h.setServices(s);
        }

        if (req.checkInHour() != null)
            h.setCheckInHour(req.checkInHour());
        if (req.checkOutHour() != null)
            h.setCheckOutHour(req.checkOutHour());

        if (req.closedDays() != null) {
            h.getClosedDays().clear();
            h.getClosedDays().addAll(req.closedDays());
        }

        if (req.highSeason() != null) {
            var season = h.getHighSeason() == null ? new Hotel.Season() : h.getHighSeason();
            season.setFromDate(req.highSeason().from());
            season.setToDate(req.highSeason().to());
            h.setHighSeason(season);
        }

        if (req.cancellationPolicy() != null)
            h.setCancellationPolicy(req.cancellationPolicy());
        if (req.minAge() != null)
            h.setMinAge(req.minAge());
        if (req.petsAllowed() != null)
            h.setPetsAllowed(req.petsAllowed());

        if (req.acceptedPayments() != null) {
            h.getAcceptedPayments().clear();
            h.getAcceptedPayments().addAll(req.acceptedPayments());
        }

        if (req.active() != null)
            h.setActive(req.active());
    }

}