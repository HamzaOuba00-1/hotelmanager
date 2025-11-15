
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  QrCode, Camera, LogIn, LogOut, Check, X, Clock, RefreshCcw, Copy,
  CheckCircle, AlertTriangle, XCircle,
} from "lucide-react";
import { format, parseISO, differenceInMinutes } from "date-fns";
import {
  checkIn,
  checkOut,
  getCurrentDailyCode,
  getMyOpenAttendance,
  listMyAttendance,
  type AttendanceDto,
  type DailyCodeResponse,
  type CheckInRequest,
} from "../../../api/pointage";

const pad2 = (n: number) => String(n).padStart(2, "0");
const toHM = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
const todayLocal = format(new Date(), "yyyy-MM-dd"); // local (pas UTC)

declare global { interface Window { BarcodeDetector?: any; } }
function parseQrPayload(text: string): { code: string; date?: string } | null {
  try {
    const obj = JSON.parse(text);
    if (obj && typeof obj.code === "string") return { code: String(obj.code).trim(), date: obj.date };
  } catch {}
  if (typeof text === "string" && text.trim().length >= 4) return { code: text.trim() };
  return null;
}

const SS_KEY = "attendance.open";
const REQUIRE_CODE_FOR_CHECKOUT = true;

export default function PointageEmployePage() {
  const [dailyCode, setDailyCode] = useState<DailyCodeResponse | null>(null);
  const [loadingCode, setLoadingCode] = useState(false);
  const [now, setNow] = useState<Date>(new Date());

  const [manualCode, setManualCode] = useState("");
  const [scanned, setScanned] = useState<{ code: string; date?: string } | null>(null);
  const effectiveCode = (scanned?.code || manualCode).trim();
  const [scannerOpen, setScannerOpen] = useState(false);

  const [myAttendance, setMyAttendance] = useState<AttendanceDto | null>(null);
  const [meId, setMeId] = useState<number | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(todayLocal);
  const [statusFilter, setStatusFilter] = useState<"" | "PRESENT" | "RETARD" | "ABSENT">("");
  const [dayRows, setDayRows] = useState<AttendanceDto[]>([]);
  const [loadingDay, setLoadingDay] = useState(false);

  const [loadingCheckIn, setLoadingCheckIn] = useState(false);
  const [loadingCheckOut, setLoadingCheckOut] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 1800); };

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const saveOpenToSession = (att: AttendanceDto | null) => {
    try {
      if (att && !att.checkOutAt) sessionStorage.setItem(SS_KEY, JSON.stringify(att));
      else sessionStorage.removeItem(SS_KEY);
    } catch {}
  };
  const restoreFromSession = () => {
    try {
      const raw = sessionStorage.getItem(SS_KEY);
      if (!raw) return;
      const att = JSON.parse(raw) as AttendanceDto;
      if (att && !att.checkOutAt) {
        setMyAttendance(att);
        setMeId(att.employeeId);
      } else sessionStorage.removeItem(SS_KEY);
    } catch { sessionStorage.removeItem(SS_KEY); }
  };

  const loadCode = async () => {
    setLoadingCode(true);
    try {
      const res = await getCurrentDailyCode();
      setDailyCode(res);
    } catch (e: any) {
      const s = e?.response?.status;
      if (s === 404) showToast("Aucun code actif pour aujourd’hui.");
      else showToast(e?.response?.data?.detail ?? "Erreur lors du chargement du code");
    } finally {
      setLoadingCode(false);
    }
  };

  const loadOpen = async () => {
    try {
      const att = await getMyOpenAttendance(); 
      setMyAttendance(att);
      if (att?.employeeId) setMeId(att.employeeId);
      saveOpenToSession(att);
    } catch (e) { console.error(e); }
  };

  const loadDay = async () => {
    setLoadingDay(true);
    try {
      const res = await listMyAttendance({ start: selectedDate, end: selectedDate });
      setDayRows(res);
    } catch (e: any) {
      if (e?.response?.status === 403) {
        showToast("Tu n’as pas accès à la liste côté serveur (MANAGER requis).");
      } else {
        showToast(e?.response?.data?.detail ?? "Échec chargement des pointages");
      }
      setDayRows([]);
    } finally {
      setLoadingDay(false);
    }
  };

  useEffect(() => {
    restoreFromSession();
    loadCode();
    loadOpen();
  }, []);
  useEffect(() => { loadDay(); }, [selectedDate, meId]);

  const { secondsLeft, progressPct, validUntilText } = useMemo(() => {
    if (!dailyCode) return { secondsLeft: 0, progressPct: 0, validUntilText: "--:--" };
    const end = parseISO(dailyCode.validUntil);
    const start = dailyCode.validFrom ? parseISO(dailyCode.validFrom) : new Date(end.getTime() - 15 * 60 * 1000);
    const total = Math.max(1, Math.floor((end.getTime() - start.getTime()) / 1000));
    const left = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
    const elapsed = Math.max(0, total - left);
    const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
    return { secondsLeft: left, progressPct: pct, validUntilText: toHM(end) };
  }, [dailyCode, now]);
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const doCheckIn = async () => {
    if (!effectiveCode) { showToast("Scanne ou saisis un code valide."); return; }
    setLoadingCheckIn(true);
    try {
      const payload: CheckInRequest = { code: effectiveCode };
      const res = await checkIn(payload);
      setMyAttendance(res);
      setMeId(res.employeeId);
      saveOpenToSession(res);
      showToast("Pointage effectué ✅");
      setManualCode("");
      setScanned(null);
      loadDay();
    } catch (e: any) {
      const s = e?.response?.status;
      const d = e?.response?.data?.detail;
      if (s === 409) showToast("Pointage déjà ouvert — clique « Sortir » pour le clôturer.");
      else if (s === 404) showToast("Code expiré ou introuvable.");
      else if (s === 422) showToast("Code invalide.");
      else showToast(d ?? "Échec du pointage");
      await loadOpen();
    } finally { setLoadingCheckIn(false); }
  };

  const doCheckOut = async () => {
    if (REQUIRE_CODE_FOR_CHECKOUT && !effectiveCode) { showToast("Entre le code du jour pour sortir."); return; }
    setLoadingCheckOut(true);
    try {
      let res: any;
      try { res = await (checkOut as any)({ code: effectiveCode }); }
      catch (err: any) {
        if (err?.response?.status === 400 || err?.response?.status === 415) res = await (checkOut as any)();
        else throw err;
      }
      setMyAttendance((prev) => {
        const next = prev ? { ...prev, checkOutAt: res.checkOutAt } : prev;
        saveOpenToSession(next ?? null);
        return next;
      });
      showToast("Sortie enregistrée ✅");
      loadDay();
    } catch (e: any) {
      const s = e?.response?.status; const d = e?.response?.data?.detail;
      showToast(s === 409 ? "Aucun pointage ouvert" : (d ?? "Échec de la sortie"));
      await loadOpen();
    } finally { setLoadingCheckOut(false); }
  };

  function ScannerOverlay(props: { onClose: () => void; onDetected: (text: string) => void; }) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<number | null>(null);
    const detectorRef = useRef<any | null>(null);

    const cleanup = async () => {
      if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
      if (streamRef.current) { for (const t of streamRef.current.getTracks()) t.stop(); streamRef.current = null; }
    };

    useEffect(() => {
      (async () => {
        try {
          if (!("BarcodeDetector" in window)) { showToast("Scanner non supporté — utilise la saisie manuelle."); props.onClose(); return; }
          detectorRef.current = new window.BarcodeDetector({ formats: ["qr_code"] });
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
          streamRef.current = stream;
          if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
          timerRef.current = window.setInterval(async () => {
            if (!videoRef.current || !detectorRef.current) return;
            try {
              const codes = await detectorRef.current.detect(videoRef.current);
              const first = Array.isArray(codes) && codes.length ? codes[0] : null;
              if (first?.rawValue) { await cleanup(); props.onDetected(String(first.rawValue)); props.onClose(); }
            } catch {}
          }, 400);
        } catch (err) {
          console.error(err);
          showToast("Accès caméra refusé / indisponible.");
          props.onClose();
        }
      })();
      return () => { cleanup(); };
    }, []);

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="relative w-[min(96vw,560px)] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          <video ref={videoRef} className="w-full h-[60vh] object-cover bg-black" playsInline muted />
          <button onClick={props.onClose} className="absolute top-3 right-3 p-2 rounded-lg bg-white/90 hover:bg-white shadow" title="Fermer">
            <X className="w-5 h-5" />
          </button>
          <div className="absolute inset-x-0 bottom-0 p-3 text-center text-white/90 text-sm bg-gradient-to-t from-black/60 to-transparent">
            Aligne le QR dans le cadre pour scanner
          </div>
        </div>
      </div>
    );
  }

  const codePreview = scanned?.code || manualCode || "—";
  const checkInDisabled = !effectiveCode || loadingCheckIn;
  const canCheckOut = !!myAttendance && !myAttendance.checkOutAt;
  const checkoutDisabled = !canCheckOut || loadingCheckOut || (REQUIRE_CODE_FOR_CHECKOUT && !effectiveCode);

  const StatusPill: React.FC<{ s: "PRESENT" | "RETARD" | "ABSENT" }> = ({ s }) => {
    if (s === "PRESENT")
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle className="w-3.5 h-3.5" /> Présent
        </span>
      );
    if (s === "RETARD")
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5" /> Retard
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-rose-50 text-rose-700 border border-rose-200">
        <XCircle className="w-3.5 h-3.5" /> Absent
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-white to-white p-6">
      {/* Header épuré : icône + titre */}
      <header className="max-w-3xl mx-auto text-center mb-6">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600/10 text-emerald-700 border border-emerald-200">
          <QrCode className="w-5 h-5" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-3 text-gray-900">Mon pointage</h1>
      </header>

      <main className="max-w-3xl mx-auto space-y-6">
        {/* 1) Scanner / saisir code */}
        <section className="bg-white/60 rounded-2xl border shadow p-6 text-left">
          <h2 className="font-semibold flex items-center gap-2 mb-3">
            <QrCode className="w-5 h-5" /> Scanner ou saisir le code
          </h2>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border rounded-xl p-2">
              <input
                type="text"
                inputMode="text"
                placeholder='Colle un code ou un JSON {"code":"..."}'
                className="bg-transparent outline-none w-full"
                value={manualCode}
                onChange={(e) => {
                  const v = e.target.value;
                  setManualCode(v);
                  setScanned(parseQrPayload(v));
                }}
              />
              <button
                onClick={async () => { try { await navigator.clipboard.writeText(codePreview); showToast("Code copié 📋"); } catch {} }}
                className="p-2 rounded-lg hover:bg-gray-100"
                title="Copier"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {scanned?.date && (
              <div className="text-xs text-gray-600">Date dans le QR : <b>{scanned.date}</b></div>
            )}

            <div className="flex gap-2">
              <button
                onClick={doCheckIn}
                disabled={checkInDisabled}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" /> {loadingCheckIn ? "Pointage..." : "Se pointer"}
              </button>
              <button
                onClick={doCheckOut}
                disabled={checkoutDisabled}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-black transition disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" /> {loadingCheckOut ? "Sortie..." : "Sortir"}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setScannerOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border hover:shadow"
                title="Scanner un QR"
              >
                <Camera className="w-4 h-4" /> Scanner
              </button>
              <button
                onClick={async () => { await Promise.all([loadCode(), loadOpen(), loadDay()]); }}
                disabled={loadingCode}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border hover:shadow disabled:opacity-50"
                title="Rafraîchir"
              >
                <RefreshCcw className="w-4 h-4" /> Rafraîchir
              </button>
            </div>
          </div>
        </section>

        {/* 2) Validité du code du jour */}
        <section className="bg-white/60 rounded-2xl border shadow p-6 text-left">
          <h2 className="font-semibold flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5" /> Validité du code du jour
          </h2>
          {dailyCode ? (
            <>
              <div className="text-sm text-gray-700">Valide jusqu’à <b>{validUntilText}</b></div>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="mt-2 text-sm text-gray-600">Reste {pad2(minutes)}:{pad2(seconds)}</div>
            </>
          ) : (
            <div className="text-sm text-gray-500">Aucun code actif affiché par le manager pour aujourd’hui.</div>
          )}
        </section>

        <section className="bg-white/60 rounded-2xl border shadow p-6 text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <h2 className="font-semibold">Mes pointages</h2>

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
                <span className="text-gray-500 text-sm">Statut</span>
                <select
                  className="bg-transparent outline-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="">Tous</option>
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
                  <th className="py-2">Date</th>
                  <th className="py-2">Heure entrée</th>
                  <th className="py-2">Heure sortie</th>
                  <th className="py-2">Durée</th>
                  <th className="py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {loadingDay ? (
                  <tr><td className="py-4 text-center text-gray-500" colSpan={5}>Chargement…</td></tr>
                ) : (() => {
                  const rows = (meId ? dayRows.filter(r => r.employeeId === meId) : dayRows)
                    .filter(r => (statusFilter ? r.status === statusFilter : true));
                  if (!rows.length) {
                    return <tr><td className="py-4 text-center text-gray-500" colSpan={5}>Aucun pointage pour cette date.</td></tr>;
                  }
                  return rows.map((r) => {
                    const inDt = r.checkInAt ? parseISO(r.checkInAt) : null;
                    const outDt = r.checkOutAt ? parseISO(r.checkOutAt) : null;
                    const diffMin = inDt && outDt ? Math.max(0, differenceInMinutes(outDt, inDt)) : null;
                    const durTxt = diffMin != null ? `${Math.floor(diffMin / 60)}h${pad2(diffMin % 60)}` : "—";
                    return (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="py-2">{r.date}</td>
                        <td className="py-2">{inDt ? format(inDt, "HH:mm") : "—"}</td>
                        <td className="py-2">{outDt ? format(outDt, "HH:mm") : "—"}</td>
                        <td className="py-2">{durTxt}</td>
                        <td className="py-2"><StatusPill s={r.status as any} /></td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>

          
        </section>
      </main>

      {scannerOpen && (
        <ScannerOverlay
          onClose={() => setScannerOpen(false)}
          onDetected={(text) => {
            const parsed = parseQrPayload(text);
            if (parsed?.code) { setScanned(parsed); setManualCode(""); showToast("Code scanné ✅"); }
            else showToast("QR invalide.");
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 px-5 py-3 rounded-lg bg-emerald-600 text-white shadow-xl animate-slideIn z-50">
          <div className="flex items-center gap-2"><Check className="w-4 h-4" /> {toast}</div>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slideIn { animation: slideIn .35s ease-out; }
      `}</style>
    </div>
  );
}
