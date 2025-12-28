import React, { useEffect, useState } from "react";
import { UserRound, UsersRound, ContactRound} from "lucide-react";
import { Shift, getShiftsForHotel } from "../api/planningApi";
import { format } from "date-fns";

interface TodayTeamMember {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  startTime: string;
  endTime: string;
}

const TodayTeamSection: React.FC = () => {
  const [team, setTeam] = useState<TodayTeamMember[]>([]);

  const fetchTodayShifts = async () => {
    const today = new Date();
    const dateStr = format(today, "yyyy-MM-dd");

    try {
      const res = await getShiftsForHotel(dateStr, dateStr);
      const shifts = res.data;

      const uniqueEmployees: { [key: number]: TodayTeamMember } = {};

      shifts.forEach((shift: Shift) => {
        const { id, firstName, lastName, role } = shift.employee;

        if (!uniqueEmployees[id]) {
          uniqueEmployees[id] = {
            id,
            firstName,
            lastName,
            role,
            startTime: shift.startTime,
            endTime: shift.endTime,
          };
        }
      });

      setTeam(Object.values(uniqueEmployees));
    } catch (err) {
      console.error("Erreur lors du chargement de l’équipe du jour :", err);
    }
  };

  useEffect(() => {
    fetchTodayShifts();
  }, []);

  return (
    <div className="mt-16 text-center">
      {/* ✅ Titre avec icône */}
      <h2 className="text-3xl font-bold text-gray-800 mb-10 flex justify-center items-center gap-2">
        <UsersRound className="w-8 h-8 text-emerald-600" />
        Équipe du jour
      </h2>

      <div className="flex flex-wrap justify-center gap-6">
        {team.length === 0 ? (
          <p className="text-gray-500 text-center">Aucun shift prévu aujourd’hui.</p>
        ) : (
          team.map((member) => (
            <div
              key={member.id}
              className="flex flex-col items-center justify-center w-44 h-44 p-5 rounded-3xl 
                bg-white border border-gray-100 shadow 
                transition-transform duration-300 hover:scale-105 hover:shadow-lg"
            >
              <UserRound className="h-8 w-8 text-emerald-400 mb-2" />
              <div className="text-base font-semibold text-gray-800 text-center">
                {member.firstName} {member.lastName}
              </div>
              <div className="text-[13px] text-gray-500 uppercase mt-1 tracking-widest">
                {member.role}
              </div>
              <div className="text-sm text-gray-600 mt-2 font-medium">
                {member.startTime} – {member.endTime}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodayTeamSection;
