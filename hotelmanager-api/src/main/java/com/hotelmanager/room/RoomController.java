package com.hotelmanager.room;

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
    private final RoomRepository roomRepository;

    public RoomController(RoomService roomService, RoomRepository roomRepository) {
        this.roomService = roomService;
        this.roomRepository = roomRepository;
    }

    @PostMapping
    public ResponseEntity<Room> create(@Valid @RequestBody Room room) {
        return ResponseEntity.ok(roomService.create(room));
    }

    @GetMapping
    public ResponseEntity<List<Room>> findAll() {
        return ResponseEntity.ok(roomService.findAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Room> update(@PathVariable Long id, @Valid @RequestBody Room room) {
        return ResponseEntity.ok(roomService.update(id, room));
    }

    /** Version propre: PATCH JSON { "state": "<ENUM>" } */
    @PatchMapping("/{id}/state")
    public ResponseEntity<Room> updateStateJson(
            @PathVariable Long id,
            @RequestBody(required = false) UpdateRoomStateRequest body,
            @RequestParam(value = "state", required = false) String stateParam
    ) {
        if (body != null && body.state() != null) {
            return ResponseEntity.ok(roomService.updateState(id, body.state()));
        }
        if (stateParam != null) {
            return ResponseEntity.ok(roomService.updateState(id, stateParam));
        }
        throw new IllegalArgumentException("Paramètre 'state' manquant");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        roomService.delete(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/{id}/allowed-states")
        public Set<RoomState> allowedStates(@PathVariable Long id) {
        return roomService.allowedTargets(id);
    }
}
