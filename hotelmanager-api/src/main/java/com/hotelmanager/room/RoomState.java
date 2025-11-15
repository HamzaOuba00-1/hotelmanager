package com.hotelmanager.room;

import java.util.Locale;

public enum RoomState {
    LIBRE,
    RESERVEE,
    CHECKIN,
    ROOM_SERVICE,
    CHECKOUT,
    A_VALIDER_LIBRE,
    A_NETTOYER,
    EN_NETTOYAGE,
    MAINTENANCE,   
    INACTIVE,
    A_VALIDER_CLEAN;

    public static RoomState parse(String raw) {
        if (raw == null) throw new IllegalArgumentException("state is required");
        String s = raw.trim().toUpperCase(Locale.ROOT)
                .replace('-', '_')
                .replace(' ', '_')
                .replace("É", "E"); 
        s = s.replace("RESERVE", "RESERVEE")
             .replace("ROOM_SERVICE", "ROOM_SERVICE")
             .replace("A_VALIDER_(LIBRE)", "A_VALIDER_LIBRE")
             .replace("A_VALIDER_(CLEAN)", "A_VALIDER_CLEAN")
             .replace("A_NETTOYAGE", "A_NETTOYER");

        return RoomState.valueOf(s);
    }
}
