
import React, { useEffect, useMemo, useRef, useState } from "react";
import { exportElementToPDF } from "../../../utils/exportPdf";
import {
  QrCode,
  RefreshCcw,
  Clock,
  Copy,
  Download,
  Filter,
  Calendar,
  Users,
  BarChart3,
  Check,
  Plus,
  X,
  LogOut,
  Trash2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Minus,
} from "lucide-react";
import {
  format,
  parseISO,
  differenceInMinutes,
  parse,
  addMinutes,
} from "date-fns";
import {
  getCurrentDailyCode,
  regenerateDailyCode,
  listAttendance,
  createManualAttendance,
  checkoutAttendance,
  deleteAttendance,
  type AttendanceDto,
  type DailyCodeResponse,
  type CreateManualAttendanceRequest,
} from "../../../api/pointage";
import { getUsersFromMyHotel } from "../../../api/userApi";
import { getShiftsForHotel, type Shift } from "../../../api/planningApi";
import { QRCodeSVG } from "qrcode.react";

// Utils
const pad2 = (n: number) => String(n).padStart(2, "0");
const toHM = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
const joinDateTime = (date: string, time: string) => `${date}T${time}:00`;

// Règles métier
const LATE_GRACE_MIN = 10;

// Export CSV simple
function exportCSV(rows: any[], fileName: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv =
    headers.join(",") +
    "\n" +
    rows
      .map((r) => headers.map((h) => `"${(r as any)[h] ?? ""}"`).join(","))
      .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

type UserLite = { id: number; firstName: string; lastName: string };
type UiRow = AttendanceDto & { dynStatus: "PRESENT" | "RETARD" | "ABSENT" };

const todayLocal = format(new Date(), "yyyy-MM-dd");

export default function PointagePage() {
  const [dailyCode, setDailyCode] = useState<DailyCodeResponse | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(todayLocal);

  const [rows, setRows] = useState<AttendanceDto[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(false);

  const [statusFilter, setStatusFilter] = useState<
    "" | "PRESENT" | "RETARD" | "ABSENT"
  >("");

  const [users, setUsers] = useState<UserLite[]>([]);

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    employeeId: "",
    date: todayLocal, 
    checkIn: "",
    checkOut: "",
    status: "PRESENT",
  });

  const [confirmDel, setConfirmDel] = useState<{
    open: boolean;
    id?: number;
    name?: string;
  }>({ open: false });

  const [confirmStop, setConfirmStop] = useState<{
    open: boolean;
    id?: number;
    name?: string;
  }>({ open: false });

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const qrCardRef = useRef<HTMLDivElement | null>(null);
  const kpiRef = useRef<HTMLDivElement | null>(null);
  const [teamMaxH, setTeamMaxH] = useState<number | undefined>(undefined);
  const recomputeHeights = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      const qrH = qrCardRef.current?.offsetHeight ?? 0;
      const kpiH = kpiRef.current?.offsetHeight ?? 0;
      const gap = 16; // gap-4
      const max = Math.max(220, qrH - kpiH - gap);
      setTeamMaxH(max);
    } else {
      setTeamMaxH(undefined);
    }
  };
  useEffect(() => {
    recomputeHeights();
    window.addEventListener("resize", recomputeHeights);
    return () => window.removeEventListener("resize", recomputeHeights);
  }, []);
  useEffect(() => {
    recomputeHeights();
  }, [dailyCode, rows, shifts, selectedDate, loadingShifts]);

  const loadCode = async () => {
    try {
      const res = await getCurrentDailyCode();
      setDailyCode(res);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 404) {
        setDailyCode(null);
        showToast("Aucun code actif — clique sur « Régénérer »");
      } else if (status === 409) {
        showToast("Conflit: principal sans hôtel ? Vérifie la session.");
      } else {
        showToast(
          e?.response?.data?.detail ?? "Erreur lors du chargement du code"
        );
      }
    }
  };

  const onRegenerate = async () => {
    try {
      const res = await regenerateDailyCode();
      setDailyCode(res);
      showToast("Nouveau code généré ✅");
    } catch (e: any) {
      console.error(e);
      showToast(e?.response?.data?.detail ?? "Échec régénération");
    }
  };

  const loadRows = async () => {
    setLoadingRows(true);
    try {
      const res = await listAttendance({
        start: selectedDate,
        end: selectedDate,
      });
      setRows(res);
    } catch (e: any) {
      console.error(e);
      showToast(
        e?.response?.data?.detail ?? "Impossible de charger les pointages"
      );
    } finally {
      setLoadingRows(false);
    }
  };

  const loadShifts = async () => {
    setLoadingShifts(true);
    try {
      const { data } = await getShiftsForHotel(selectedDate, selectedDate);
      setShifts(data || []);
    } catch (e) {
      console.error(e);
      showToast("Impossible de charger le planning");
    } finally {
      setLoadingShifts(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await getUsersFromMyHotel();
      setUsers(res as any);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCode();
    loadUsers();
  }, []);
  useEffect(() => {
    loadRows();
    loadShifts();
  }, [selectedDate]);

  const { secondsLeft, progressPct, validUntilText } = useMemo(() => {
    if (!dailyCode)
      return { secondsLeft: 0, progressPct: 0, validUntilText: "--:--" };
    const end = parseISO(dailyCode.validUntil);
    const start = dailyCode.validFrom
      ? parseISO(dailyCode.validFrom)
      : new Date(end.getTime() - 15 * 60 * 1000);
    const total = Math.max(
      1,
      Math.floor((end.getTime() - start.getTime()) / 1000)
    );
    const left = Math.max(0, Math.floor((end.getTime() - Date.now()) / 1000));
    const elapsed = Math.max(0, total - left);
    const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
    return { secondsLeft: left, progressPct: pct, validUntilText: toHM(end) };
  }, [dailyCode]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const shiftIndex = useMemo(() => {
    const map = new Map<string, Shift[]>();
    (shifts || []).forEach((s) => {
      const k = `${s.employee.id}-${s.date}`;
      const arr = map.get(k) || [];
      arr.push(s);
      map.set(k, arr);
    });
    return map;
  }, [shifts]);

  const computeDynamicStatus = (
    r: AttendanceDto
  ): "PRESENT" | "RETARD" | "ABSENT" => {
    if ((r as any).status === "ABSENT") return "ABSENT";
    const key = `${r.employeeId}-${r.date}`;
    const candidates = shiftIndex.get(key) || [];
    if (!candidates.length) return (r as any).status || "PRESENT";

    const inDt = parseISO(r.checkInAt);
    let chosen: Shift | undefined = candidates.find((s) => {
      const st = parse(
        `${s.date} ${s.startTime}`,
        "yyyy-MM-dd HH:mm",
        new Date()
      );
      const et = parse(
        `${s.date} ${s.endTime}`,
        "yyyy-MM-dd HH:mm",
        new Date()
      );
      return inDt >= st && inDt <= et;
    });
    if (!chosen) {
      chosen = candidates.slice().sort((a, b) => {
        const aSt = parse(
          `${a.date} ${a.startTime}`,
          "yyyy-MM-dd HH:mm",
          new Date()
        ).getTime();
        const bSt = parse(
          `${b.date} ${b.startTime}`,
          "yyyy-MM-dd HH:mm",
          new Date()
        ).getTime();
        return Math.abs(inDt.getTime() - aSt) - Math.abs(inDt.getTime() - bSt);
      })[0];
    }
    if (!chosen) return (r as any).status || "PRESENT";

    const startDt = parse(
      `${chosen.date} ${chosen.startTime}`,
      "yyyy-MM-dd HH:mm",
      new Date()
    );
    const lateLimit = addMinutes(startDt, LATE_GRACE_MIN);
    return inDt > lateLimit ? "RETARD" : "PRESENT";
  };

  type LiveStatus = "RIEN" | "RETARD" | "ABSENT" | "PRESENT";
  type DayEmployee = {
    employeeId: number;
    name: string;
    startTime: string;
    endTime: string;
    status: LiveStatus;
    reason?: string;
    checkInAt?: string;
    checkOutAt?: string;
  };

  const dayTeam: DayEmployee[] = useMemo(() => {
    const byEmp = new Map<number, AttendanceDto[]>();
    rows.forEach((r) => {
      if (r.date === selectedDate) {
        const arr = byEmp.get(r.employeeId) || [];
        arr.push(r);
        byEmp.set(r.employeeId, arr);
      }
    });

    return (shifts || [])
      .filter((s) => s.date === selectedDate)
      .map((s) => {
        const name = `${s.employee.firstName} ${s.employee.lastName}`;
        const startDt = parse(
          `${s.date} ${s.startTime}`,
          "yyyy-MM-dd HH:mm",
          new Date()
        );
        const endDt = parse(
          `${s.date} ${s.endTime}`,
          "yyyy-MM-dd HH:mm",
          new Date()
        );
        const grace = addMinutes(startDt, LATE_GRACE_MIN);

        const list = (byEmp.get(s.employee.id) || [])
          .slice()
          .sort((a, b) => a.checkInAt.localeCompare(b.checkInAt));
        const att = list.length ? list[list.length - 1] : undefined;

        let status: LiveStatus = "RIEN";
        let reason = "";

        if (att) {
          const inDt = parseISO(att.checkInAt);
          const isLate = inDt > grace;
          if (att.checkOutAt) {
            status = "RIEN";
            reason = "Sorti";
          } else {
            status = isLate ? "RETARD" : "PRESENT";
            reason = isLate
              ? `Entrée à ${format(inDt, "HH:mm")}`
              : "En service";
          }
        } else {
          if (Date.now() < startDt.getTime()) {
            status = "RIEN";
            reason = "À venir";
          } else if (
            Date.now() >= startDt.getTime() &&
            Date.now() < endDt.getTime()
          ) {
            status = Date.now() > grace.getTime() ? "RETARD" : "RIEN";
            reason =
              Date.now() > grace.getTime() ? "Non pointé" : "Début imminent";
          } else if (Date.now() >= endDt.getTime()) {
            status = "ABSENT";
            reason = "Pas de pointage";
          }
        }

        return {
          employeeId: s.employee.id,
          name,
          startTime: s.startTime,
          endTime: s.endTime,
          status,
          reason,
          checkInAt: att?.checkInAt,
          checkOutAt: att?.checkOutAt,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [shifts, rows, selectedDate]);

  const tableRows: UiRow[] = useMemo(() => {
    const mappedRows: UiRow[] = rows.map((r) => ({
      ...r,
      dynStatus: computeDynamicStatus(r),
    })) as UiRow[];

    const employeesWithRows = new Set(rows.map((r) => r.employeeId));
    const syntheticAbsents: UiRow[] = (shifts || [])
      .filter(
        (s) => s.date === selectedDate && !employeesWithRows.has(s.employee.id)
      )
      .map((s) => {
        const uniq =
          s.employee.id * 100000 + parseInt(s.startTime.replace(":", ""), 10);
        return {
          id: -uniq,
          employeeId: s.employee.id,
          firstName: s.employee.firstName,
          lastName: s.employee.lastName,
          date: s.date,
          checkInAt: `${s.date}T${s.startTime}:00`,
          checkOutAt: null as any,
          status: "ABSENT" as any,
          source: "PLANNING" as any,
          dynStatus: "ABSENT",
        } as unknown as UiRow;
      });

    const all = [...mappedRows, ...syntheticAbsents];
    if (!statusFilter) return all;
    return all.filter((r) => r.dynStatus === statusFilter);
  }, [rows, statusFilter, shifts, selectedDate, shiftIndex]);

  const stats = useMemo(() => {
    const present = dayTeam.filter((e) => e.status === "PRESENT").length;
    const retard = dayTeam.filter((e) => e.status === "RETARD").length;
    const absent = dayTeam.filter((e) => e.status === "ABSENT").length;
    const durations = rows
      .filter((r) => r.checkOutAt)
      .map((r) =>
        Math.max(
          0,
          differenceInMinutes(parseISO(r.checkOutAt!), parseISO(r.checkInAt))
        )
      );
    const avg = durations.length
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;
    const avgTxt = `${Math.floor(avg / 60)}h${pad2(avg % 60)}`;
    return { present, absent, retard, avgTxt };
  }, [dayTeam, rows]);

  const handleExport = () => {
    const plain = tableRows.map((r) => ({
      Date: r.date,
      Employe: `${(r as any).firstName} ${(r as any).lastName}`,
      "Heure entrée": r.checkInAt ? format(parseISO(r.checkInAt), "HH:mm") : "",
      "Heure sortie": r.checkOutAt
        ? format(parseISO(r.checkOutAt), "HH:mm")
        : "",
      Statut: r.dynStatus,
      Source: (r as any).source ?? "",
    }));
    exportCSV(plain, `pointage_${selectedDate}.csv`);
  };

  const codeValue = dailyCode?.code ?? "------";

  const qrExportRef = useRef<HTMLDivElement | null>(null);
  const onExportQR = async () => {
    if (!qrExportRef.current) return;
    try {
      await exportElementToPDF(qrExportRef.current, {
        fileName: `code_qr_${selectedDate}.pdf`,
        orientation: "p",
        scale: 2,
        marginMm: 25,
        headerText: `Code journalier — ${selectedDate}`,
      });
      showToast("PDF généré ✅");
    } catch (e) {
      console.error(e);
      showToast("Échec génération PDF");
    }
  };

  const onStop = async (id: number) => {
    try {
      await checkoutAttendance(id);
      showToast("Pointage arrêté ✅");
      await loadRows();
    } catch (e: any) {
      console.error(e);
      const s = e?.response?.status;
      if (s === 404 || s === 405)
        showToast("API 'checkout' manquante côté back");
      else showToast(e?.response?.data?.detail ?? "Échec arrêt pointage");
    }
  };
  const onDelete = async () => {
    if (!confirmDel.id) return;
    try {
      await deleteAttendance(confirmDel.id);
      setConfirmDel({ open: false });
      showToast("Pointage supprimé 🗑️");
      await loadRows();
    } catch (e: any) {
      console.error(e);
      const s = e?.response?.status;
      if (s === 404 || s === 405) showToast("API 'delete' manquante côté back");
      else showToast(e?.response?.data?.detail ?? "Échec suppression");
    }
  };

  const onSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId || !form.date || !form.checkIn) {
      showToast("Champs obligatoires manquants");
      return;
    }
    try {
      const payload: CreateManualAttendanceRequest = {
        employeeId: parseInt(form.employeeId, 10),
        date: form.date,
        checkInAt: joinDateTime(form.date, form.checkIn),
        checkOutAt: form.checkOut
          ? joinDateTime(form.date, form.checkOut)
          : undefined,
        status: form.status as any,
        source: "MANUAL",
      };
      await createManualAttendance(payload);
      setAddOpen(false);
      showToast("Pointage ajouté ✅");
      setForm({
        employeeId: "",
        date: selectedDate,
        checkIn: "",
        checkOut: "",
        status: "PRESENT",
      });
      loadRows();
    } catch (e: any) {
      console.error(e);
      const s = e?.response?.status;
      if (s === 404 || s === 405) {
        showToast("API 'manual' manquante côté back");
      } else {
        showToast(e?.response?.data?.detail ?? "Échec ajout pointage");
      }
    }
  };

  const StatusPill: React.FC<{
    s: "PRESENT" | "RETARD" | "ABSENT" | "RIEN";
  }> = ({ s }) => {
    if (s === "PRESENT")
      return (
        <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5" /> Présent
        </span>
      );
    if (s === "RETARD")
      return (
        <span className="px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" /> Retard
        </span>
      );
    if (s === "ABSENT")
      return (
        <span className="px-2 py-0.5 rounded-full text-xs bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
          <XCircle className="w-3.5 h-3.5" /> Absent
        </span>
      );
    return (
      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-50 text-gray-700 border border-gray-200 flex items-center gap-1">
        <Minus className="w-3.5 h-3.5" /> —
      </span>
    );
  };

  return (
    <div className="p-6 text-center">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <QrCode className="h-8 w-8 text-emerald-600" /> Page de pointage
        </h1>

        <div className="flex gap-2">
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl shadow hover:bg-emerald-700 transition"
          >
            <Plus className="w-4 h-4" />
            Ajouter pointage
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 border rounded-xl shadow hover:shadow-md transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          <button
            onClick={onRegenerate}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl shadow hover:bg-emerald-700 transition"
          >
            <RefreshCcw className="w-4 h-4" />
            Régénérer
          </button>
        </div>
      </div>

      {/* Ligne : QR à gauche — Équipe + KPI à droite */}
      <section className="grid md:grid-cols-[390px_1fr] gap-6 items-start mb-8">
        {/* Colonne gauche : QR */}
        <div
          ref={qrCardRef}
          className="bg-white/60 rounded-2xl border shadow p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <QrCode className="w-5 h-5" /> Code journalier
            </h2>
            <button
              onClick={onExportQR}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm inline-flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Télécharger PDF
            </button>
          </div>

          {/* ✅ Seul ce bloc sera exporté en PDF (QR + texte du code) */}
          <div
            ref={qrExportRef}
            className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl inline-block"
            style={{ border: "1px solid transparent" }}
          >
            <div className="bg-white p-2 rounded-xl border">
              <QRCodeSVG
                id="daily-qr"
                value={JSON.stringify({ code: codeValue, date: selectedDate })}
                size={160}
                marginSize={4}
              />
            </div>

            <div
              className="text-2xl font-extrabold tracking-widest"
              style={{ wordBreak: "break-all" }} 
            >
              {codeValue}
            </div>
          </div>

          {/* Bouton Copier en dehors de la zone exportée */}
          <div className="flex items-center justify-center mt-2">
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(codeValue);
                  showToast("Code copié 📋");
                } catch {}
              }}
              className="p-2 rounded-lg hover:bg-gray-100"
              title="Copier"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          {/* Compte à rebours (hors PDF) */}
          <div className="w-full mt-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>
                Valide jusqu’à <strong>{validUntilText}</strong> — reste{" "}
                {pad2(hours)}:{pad2(minutes)}:{pad2(seconds)}
              </span>
            </div>
            <div className="h-2 mt-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Colonne droite : Équipe + KPI */}
        <div className="flex flex-col gap-4">
          {/* Équipe du jour */}
          <div
            className="bg-white/60 rounded-2xl border shadow p-6 overflow-auto overscroll-contain"
            style={teamMaxH ? { maxHeight: teamMaxH } : undefined}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" /> Équipe du jour — statut
              </h2>
              <div className="text-sm text-gray-500">{selectedDate}</div>
            </div>

            {loadingShifts ? (
              <div className="text-sm text-gray-500">
                Chargement du planning…
              </div>
            ) : dayTeam.length ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                {dayTeam.map((e, idx) => (
                  <div
                    key={`${e.employeeId}-${e.startTime}-${e.endTime}-${idx}`}
                    className="bg-white/80 border rounded-xl p-3 flex items-center justify-between"
                  >
                    <div className="text-left">
                      <div className="font-medium">{e.name}</div>
                      <div className="text-xs text-gray-500">
                        {e.startTime}–{e.endTime}
                        {e.reason ? <> • {e.reason}</> : null}
                      </div>
                    </div>
                    <StatusPill s={e.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Aucun shift planifié pour cette date.
              </div>
            )}

            <div className="text-xs text-gray-400 mt-2">
              Règles : <b>Rien</b> (pas commencé / déjà sorti), <b>Retard</b> (à
              partir de {LATE_GRACE_MIN} min après le début{" "}
              <u>jusqu’à la fin du shift</u> si non pointé / entrée tardive),{" "}
              <b>Absent</b> (shift terminé sans pointage).
            </div>
          </div>

          {/* KPI */}
          <div ref={kpiRef} className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white/60 rounded-2xl border shadow p-5">
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Users className="w-4 h-4" /> Présents
              </div>
              <div className="text-3xl font-bold mt-1">{stats.present}</div>
            </div>
            <div className="bg-white/60 rounded-2xl border shadow p-5">
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Users className="w-4 h-4" /> Absents
              </div>
              <div className="text-3xl font-bold mt-1">{stats.absent}</div>
            </div>
            <div className="bg-white/60 rounded-2xl border shadow p-5">
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Durée moyenne
              </div>
              <div className="text-3xl font-bold mt-1">{stats.avgTxt}</div>
              <div className="text-xs text-gray-500 mt-1">
                Retards aujourd’hui : <b>{stats.retard}</b>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 : Tableau */}
      <section className="bg-white/60 rounded-2xl border shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Pointage du jour
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-50 border rounded-xl pl-3 pr-2 py-1.5">
              <input
                type="date"
                className="bg-transparent outline-none"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 bg-gray-50 border rounded-xl px-3 py-1.5">
              <Filter className="w-4 h-4" />
              <select
                className="bg-transparent outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="">Statut</option>
                <option value="PRESENT">Présent</option>
                <option value="RETARD">Retard</option>
                <option value="ABSENT">Absent</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2">Employé</th>
                <th className="py-2">Heure entrée</th>
                <th className="py-2">Heure sortie</th>
                <th className="py-2">Durée</th>
                <th className="py-2">Statut</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingRows ? (
                <tr>
                  <td className="py-4 text-center text-gray-500" colSpan={6}>
                    Chargement...
                  </td>
                </tr>
              ) : tableRows.length ? (
                tableRows.map((r) => {
                  const hasIn = !!r.checkInAt;
                  const inDt = hasIn ? parseISO(r.checkInAt) : null;
                  const outDt = r.checkOutAt ? parseISO(r.checkOutAt) : null;
                  const diffMin =
                    hasIn && outDt
                      ? Math.max(0, differenceInMinutes(outDt, inDt!))
                      : null;
                  const durTxt =
                    diffMin != null
                      ? `${Math.floor(diffMin / 60)}h${pad2(diffMin % 60)}`
                      : "—";
                  const isSynthetic = r.id < 0;
                  return (
                    <tr key={String(r.id)} className="border-b last:border-0">
                      <td className="py-2 font-medium">
                        {(r as any).firstName} {(r as any).lastName}
                      </td>
                      <td className="py-2">
                        {hasIn ? format(inDt!, "HH:mm") : "—"}
                      </td>
                      <td className="py-2">
                        {outDt ? format(outDt, "HH:mm") : "—"}
                      </td>
                      <td className="py-2">{durTxt}</td>
                      <td className="py-2 text-center">
                        {r.dynStatus === "PRESENT" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5" /> Présent
                          </span>
                        )}
                        {r.dynStatus === "RETARD" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5" /> Retard
                          </span>
                        )}
                        {r.dynStatus === "ABSENT" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5" /> Absent
                          </span>
                        )}
                      </td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          {/* Arrêter (si réel et sans sortie) */}
                          {!isSynthetic && !r.checkOutAt && (
                            <button
                              onClick={() =>
                                setConfirmStop({
                                  open: true,
                                  id: r.id,
                                  name: `${(r as any).firstName} ${
                                    (r as any).lastName
                                  }`,
                                })
                              }
                              className="px-2 py-1 rounded-lg border hover:bg-gray-100"
                              title="Arrêter (ajouter une sortie)"
                            >
                              <LogOut className="w-4 h-4" />
                            </button>
                          )}
                          {/* Supprimer (si réel) */}
                          {!isSynthetic && (
                            <button
                              onClick={() =>
                                setConfirmDel({
                                  open: true,
                                  id: r.id,
                                  name: `${(r as any).firstName} ${
                                    (r as any).lastName
                                  }`,
                                })
                              }
                              className="px-2 py-1 rounded-lg border hover:bg-rose-50"
                              title="Supprimer ce pointage"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="py-4 text-center text-gray-500" colSpan={6}>
                    Aucun pointage pour cette date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Popup ajout pointage */}
      {addOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/60 rounded-2xl shadow-xl p-8 w-full max-w-md animate-fadeIn text-left">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Ajouter un pointage
              </h2>
              <button
                onClick={() => setAddOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={onSubmitAdd}>
              <label className="block text-sm font-medium">
                Employé
                <select
                  required
                  value={form.employeeId}
                  onChange={(e) =>
                    setForm({ ...form, employeeId: e.target.value })
                  }
                  className="w-full border border-gray-300 p-2 rounded-xl mt-1"
                >
                  <option value="">Sélectionner</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium">
                Date
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-gray-300 p-2 rounded-xl mt-1"
                />
              </label>

              <div className="flex gap-2">
                <label className="block text-sm font-medium w-full">
                  Entrée
                  <input
                    type="time"
                    required
                    value={form.checkIn}
                    onChange={(e) =>
                      setForm({ ...form, checkIn: e.target.value })
                    }
                    className="w-full border border-gray-300 p-2 rounded-xl mt-1"
                  />
                </label>
                <label className="block text-sm font-medium w-full">
                  Sortie (optionnel)
                  <input
                    type="time"
                    value={form.checkOut}
                    onChange={(e) =>
                      setForm({ ...form, checkOut: e.target.value })
                    }
                    className="w-full border border-gray-300 p-2 rounded-xl mt-1"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium">
                Statut
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-300 p-2 rounded-xl mt-1"
                >
                  <option value="PRESENT">Présent</option>
                  <option value="RETARD">Retard</option>
                  <option value="ABSENT">Absent</option>
                </select>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>

          <style>{`
            @keyframes fadeIn { from { opacity:0; transform: translateY(8px);} to { opacity:1; transform: translateY(0);} }
            .animate-fadeIn { animation: fadeIn .3s ease-out; }
          `}</style>
        </div>
      )}

      {/* Popup CONFIRM DELETE */}
      {confirmDel.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/60 rounded-2xl shadow-xl p-6 w-full max-w-sm animate-fadeIn text-left">
            <h3 className="text-lg font-semibold mb-3">
              Supprimer ce pointage ?
            </h3>
            <p className="text-sm text-gray-700 mb-5">
              Cette action est définitive.
              {confirmDel.name ? (
                <>
                  {" "}
                  Employé : <b>{confirmDel.name}</b>.
                </>
              ) : null}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDel({ open: false })}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={onDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup CONFIRM STOP */}
      {confirmStop.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/60 rounded-2xl shadow-xl p-6 w-full max-w-sm animate-fadeIn text-left">
            <h3 className="text-lg font-semibold mb-3">
              Arrêter ce pointage ?
            </h3>
            <p className="text-sm text-gray-700 mb-5">
              Cette action ajoutera une heure de sortie à l'employé.
              {confirmStop.name ? (
                <>
                  {" "}
                  Employé : <b>{confirmStop.name}</b>.
                </>
              ) : null}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmStop({ open: false })}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  if (confirmStop.id) {
                    await onStop(confirmStop.id);
                    setConfirmStop({ open: false });
                  }
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Arrêter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 px-5 py-3 rounded-lg bg-emerald-600 text-white shadow-xl animate-slideIn z-50">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" /> {toast}
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slideIn { animation: slideIn .35s ease-out; }
      `}</style>
    </div>
  );
}
