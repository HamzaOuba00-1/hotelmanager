package com.hotelmanager.hotel.controller;

import com.hotelmanager.hotel.dto.HotelConfigResponse;
import com.hotelmanager.hotel.mapper.HotelManualMapper;
import com.hotelmanager.hotel.service.HotelService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/public/hotels")
@RequiredArgsConstructor
public class PublicHotelController {

    private final HotelService hotelService;
    private final HotelManualMapper mapper;

    @GetMapping
    public List<HotelConfigResponse> listPublicHotels() {
        return hotelService.listActiveHotels()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public HotelConfigResponse getPublicHotel(@PathVariable Long id) {
        var h = hotelService.getActiveHotelById(id);
        if (h == null || Boolean.FALSE.equals(h.getActive())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Hôtel introuvable");
        }
        return mapper.toResponse(h);
    }
}
