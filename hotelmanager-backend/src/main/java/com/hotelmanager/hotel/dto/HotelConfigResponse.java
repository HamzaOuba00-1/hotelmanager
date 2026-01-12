package com.hotelmanager.hotel.dto;

import java.util.List;

public record HotelConfigResponse(
    Long id,
    String name,
    String code,

    String address,
    String phone,
    String email,
    String logoUrl,
    Double latitude,
    Double longitude,

    Integer floors,
    Integer roomsPerFloor,
    List<String> floorLabels,
    List<String> roomTypes,

    ServicesDTO services,

    String checkInHour,
    String checkOutHour,
    List<String> closedDays,
    SeasonDTO highSeason,

    String cancellationPolicy,
    Integer minAge,
    Boolean petsAllowed,
    List<String> acceptedPayments,

    Boolean active

) {
    public record ServicesDTO(
        Boolean hasRestaurant,
        Boolean hasLaundry,
        Boolean hasShuttle,
        Boolean hasGym,
        Boolean hasPool,
        Boolean hasBusinessCenter
    ) {}

    public record SeasonDTO(String from, String to) {}
}
