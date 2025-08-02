package com.hotelmanager.hotel.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public record HotelConfigRequest(
    @NotBlank String name,
    String address,
    String phone,
    @Email String email,
    String logoUrl,
    Double latitude,
    Double longitude,

    @Min(0) Integer floors,
    @Min(0) Integer roomsPerFloor,
    List<@Size(max = 50) String> floorLabels,
    List<@Size(max = 50) String> roomTypes,

    ServicesDTO services,

    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$") String checkInHour, // HH:mm
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$") String checkOutHour, // HH:mm
    List<@Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$") String> closedDays,  // YYYY-MM-DD

    SeasonDTO highSeason,

    String cancellationPolicy,
    @Min(0) Integer minAge,
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

    public record SeasonDTO(
        @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$") String from,
        @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$") String to
    ) {}
}
