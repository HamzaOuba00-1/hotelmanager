package com.hotelmanager.room;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Map;

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

    private static final Map<String, RoomState> ALIASES = Map.ofEntries(
            Map.entry("FREE", LIBRE),
            Map.entry("LIBRE", LIBRE),

            Map.entry("RESERVE", RESERVEE),
            Map.entry("RESERVEE", RESERVEE),
            Map.entry("RESERVED", RESERVEE),

            Map.entry("CHECK_IN", CHECKIN),
            Map.entry("CHECKIN", CHECKIN),

            Map.entry("ROOMSERVICE", ROOM_SERVICE),
            Map.entry("ROOM_SERVICE", ROOM_SERVICE),

            Map.entry("CHECK_OUT", CHECKOUT),
            Map.entry("CHECKOUT", CHECKOUT),

            Map.entry("A_VALIDER_LIBRE", A_VALIDER_LIBRE),
            Map.entry("VALIDER_LIBRE", A_VALIDER_LIBRE),

            Map.entry("A_NETTOYER", A_NETTOYER),
            Map.entry("A_NETTOYAGE", A_NETTOYER),

            Map.entry("EN_NETTOYAGE", EN_NETTOYAGE),

            Map.entry("A_VALIDER_CLEAN", A_VALIDER_CLEAN),
            Map.entry("VALIDER_CLEAN", A_VALIDER_CLEAN),

            Map.entry("MAINTENANCE", MAINTENANCE),
            Map.entry("INACTIVE", INACTIVE)
    );

    public static RoomState parse(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("state is required");
        }

        String s = normalize(raw);

        RoomState alias = ALIASES.get(s);
        if (alias != null) return alias;

        return RoomState.valueOf(s);
    }

    private static String normalize(String raw) {
        String n = Normalizer.normalize(raw, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        n = n.toUpperCase(Locale.ROOT)
                .trim()
                .replace('-', '_')
                .replace(' ', '_');

        // compact forms
        n = n.replace("__", "_");

        return n;
    }
}
