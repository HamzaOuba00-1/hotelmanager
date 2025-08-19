package com.hotelmanager.room.dto;

import com.hotelmanager.room.RoomState;
import jakarta.validation.constraints.NotNull;

public record UpdateRoomStateRequest(@NotNull RoomState state) {}
