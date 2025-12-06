package com.hotelmanager.room;

import com.hotelmanager.room.dto.CreateRoomRequest;
import com.hotelmanager.room.dto.RoomResponse;
import com.hotelmanager.room.dto.UpdateRoomRequest;
import com.hotelmanager.room.dto.UpdateRoomStateRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "http://localhost:3000")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    public ResponseEntity<RoomResponse> create(@Valid @RequestBody CreateRoomRequest req) {
        Room r = new Room();
        r.setRoomNumber(req.roomNumber());
        r.setRoomType(req.roomType());
        r.setFloor(req.floor());
        r.setDescription(req.description());
        r.setActive(req.active());

        return ResponseEntity.ok(RoomResponse.from(roomService.create(r)));
    }

    @GetMapping
    public ResponseEntity<List<RoomResponse>> findAll() {
        var rooms = roomService.findAllForCurrentHotel().stream()
                .map(RoomResponse::from)
                .toList();
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/my-room")
    public ResponseEntity<RoomResponse> myRoom() {
        return ResponseEntity.ok(RoomResponse.from(roomService.findMyRoom()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoomRequest req
    ) {
        Room r = new Room();
        r.setRoomNumber(req.roomNumber());
        r.setRoomType(req.roomType());
        r.setFloor(req.floor());
        r.setDescription(req.description());
        r.setActive(req.active());

        return ResponseEntity.ok(RoomResponse.from(roomService.update(id, r)));
    }

    @PatchMapping("/{id}/state")
    public ResponseEntity<RoomResponse> updateStateJson(
            @PathVariable Long id,
            @RequestBody(required = false) UpdateRoomStateRequest body,
            @RequestParam(value = "state", required = false) String stateParam
    ) {
        if (body != null && body.state() != null) {
            return ResponseEntity.ok(RoomResponse.from(roomService.updateState(id, body.state())));
        }
        if (stateParam != null) {
            return ResponseEntity.ok(RoomResponse.from(roomService.updateState(id, stateParam)));
        }
        throw new IllegalArgumentException("Paramètre 'state' manquant");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        roomService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/allowed-states")
    public ResponseEntity<Set<RoomState>> allowedStates(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.allowedTargets(id));
    }
}
