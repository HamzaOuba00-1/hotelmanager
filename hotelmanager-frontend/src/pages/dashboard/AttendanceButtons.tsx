// src/components/AttendanceButtons.tsx
import React, { useState } from "react";
import { checkIn, checkOut } from "../../services/attendanceService";
import { AttendanceDto } from "../../types/AttendanceDto";

export default function AttendanceButtons() {
  const [message, setMessage] = useState<string>("");
  const [attendance, setAttendance] = useState<AttendanceDto | null>(null);

  const handleCheckIn = async () => {
    try {
      const data = await checkIn();
      setAttendance(data);
      setMessage(`✅ Check-in réussi à ${data.checkInAt}`);
    } catch (err: any) {
      setMessage("❌ " + (err.response?.data?.message || "Erreur lors du check-in"));
    }
  };

  const handleCheckOut = async () => {
    try {
      const data = await checkOut();
      setAttendance(data);
      setMessage(`✅ Check-out réussi à ${data.checkOutAt}`);
    } catch (err: any) {
      setMessage("❌ " + (err.response?.data?.message || "Erreur lors du check-out"));
    }
  };

  return (
    <div>
      <h2>Pointage</h2>
      <button onClick={handleCheckIn} disabled={!!attendance?.checkInAt && !attendance?.checkOutAt}>
        Check-in
      </button>
      <button onClick={handleCheckOut} disabled={!attendance?.checkInAt || !!attendance?.checkOutAt}>
        Check-out
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
