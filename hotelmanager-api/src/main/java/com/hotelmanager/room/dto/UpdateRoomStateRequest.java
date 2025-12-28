package com.hotelmanager.room.dto;

import com.hotelmanager.room.entity.RoomState;

import jakarta.validation.constraints.NotNull;

public record UpdateRoomStateRequest(@NotNull RoomState state) {}
