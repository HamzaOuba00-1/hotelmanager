// src/pages/dashboard/EmployeDashboardComponents/EmployeeProfilePage.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Save,
  User2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Mail,
  BadgeCheck,
} from "lucide-react";
import { getMyProfile, updateMyProfile, changeMyPassword } from "../../../api/userApi";
import { getMyHotel } from "../../../api/hotelApi";
import type { User } from "../../../types/User";

const card =
  "bg-white/70 backdrop-blur rounded-2xl border border-white/40 shadow-sm p-6";
const input =
  "w-full rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-emerald-500";
const label = "text-xs font-medium text-gray-500";
const btn =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition";
const btnPrimary = `${btn} bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50`;
const btnGhost = `${btn} border bg-white hover:bg-gray-50 disabled:opacity-50`;

export default function EmployeeProfilePage() {
  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Infos user
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");

  // Hotel (read-only)
  const [hotelName, setHotelName] = useState<string | undefined>();
  const [hotelLogo, setHotelLogo] = useState<string | undefined>();
  const [hotelPhone, setHotelPhone] = useState<string | undefined>();
  const [hotelEmail, setHotelEmail] = useState<string | undefined>();

  // Alerts
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const resetAlerts = () => {
    setErr(null);
    setOk(null);
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        const [u, h] = await Promise.all([
          getMyProfile(),
          getMyHotel().catch(() => null),
        ]);

        if (!mounted) return;

        setMe(u);
        setFirstName(u.firstName ?? "");
        setLastName(u.lastName ?? "");
        setEmail(u.email ?? "");

        if (h) {
          setHotelName(h.name);
          setHotelLogo(h.logoUrl ?? undefined);
          setHotelPhone(h.phone ?? undefined);
          setHotelEmail(h.email ?? undefined);
        }
      } catch (e: any) {
        if (!mounted) return;
        setErr(
          e?.response?.data?.message ||
            e?.response?.data?.detail ||
            e?.message ||
            "Impossible de charger votre profil."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const infoChanged = useMemo(() => {
    if (!me) return false;
    return (
      (firstName ?? "") !== (me.firstName ?? "") ||
      (lastName ?? "") !== (me.lastName ?? "") ||
      (email ?? "") !== (me.email ?? "")
    );
  }, [me, firstName, lastName, email]);

  const onSaveInfo = async () => {
    resetAlerts();
    if (!me) return;

    try {
      const updated = await updateMyProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      });

      setMe(updated);
      setOk("Vos informations ont été mises à jour.");
    } catch (e: any) {
      setErr(
        e?.response?.data?.message ||
          e?.response?.data?.detail ||
          e?.message ||
          "Mise à jour impossible."
      );
    }
  };

  const onResetInfo = () => {
    resetAlerts();
    if (!me) return;
    setFirstName(me.firstName ?? "");
    setLastName(me.lastName ?? "");
    setEmail(me.email ?? "");
  };

  const onChangePassword = async () => {
    resetAlerts();

    if (!currentPassword || !newPassword || !confirmNew) {
      setErr("Veuillez remplir tous les champs.");
      return;
    }
    if (newPassword.length < 8) {
      setErr("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (newPassword !== confirmNew) {
      setErr("La confirmation ne correspond pas.");
      return;
    }

    try {
      await changeMyPassword(currentPassword, newPassword);
      setOk("Mot de passe mis à jour.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNew("");
    } catch (e: any) {
      setErr(
        e?.response?.data?.message ||
          e?.response?.data?.detail ||
          e?.message ||
          "Changement de mot de passe impossible."
      );
    }
  };

  if (loading) {
    return <div className="p-8 text-sm text-gray-500">Chargement…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <User2 className="w-7 h-7 text-emerald-600" />
            Mon profil
          </h1>
          <div className="text-xs text-gray-500 mt-1">
            Gérez vos informations personnelles et votre sécurité.
          </div>
        </div>

        {/* Badge hôtel */}
        {hotelName && (
          <div className="flex items-center gap-3 bg-white/80 border rounded-2xl px-4 py-2">
            <div className="h-9 w-9 rounded-xl bg-gray-50 border overflow-hidden grid place-items-center">
              {hotelLogo ? (
                <img
                  src={hotelLogo}
                  alt="Hotel logo"
                  className="h-full w-full object-contain"
                />
              ) : (
                <Building2 className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">{hotelName}</div>
              
            </div>
          </div>
        )}
      </div>

      {/* Alerts */}
      {err && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm p-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {err}
        </div>
      )}
      {ok && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm p-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {ok}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ================= INFOS EMPLOYE ================= */}
        <section className={`${card} lg:col-span-2`}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-widest">
                Identité
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Informations personnelles
              </h2>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
              <Mail className="w-4 h-4 text-emerald-700" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="space-y-1">
              <div className={label}>Prénom</div>
              <input
                className={input}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Prénom"
              />
            </label>

            <label className="space-y-1">
              <div className={label}>Nom</div>
              <input
                className={input}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Nom"
              />
            </label>

            <label className="space-y-1 sm:col-span-2">
              <div className={label}>Email</div>
              <input
                className={input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="employe@hotel.com"
              />
            </label>

            <div className="sm:col-span-2 flex items-center gap-2 mt-1">
              <BadgeCheck className="w-4 h-4 text-emerald-600" />
              <div className="text-[11px] text-gray-500">
                Rôle :{" "}
                <span className="text-gray-700 font-medium">
                  {me?.role ?? "EMPLOYE"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              className={btnGhost}
              onClick={onResetInfo}
              disabled={!infoChanged}
            >
              Réinitialiser
            </button>
            <button
              className={btnPrimary}
              onClick={onSaveInfo}
              disabled={!infoChanged}
            >
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </section>

        {/* ================= APERCU HOTEL (READ-ONLY) ================= */}
        <aside className={card}>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
              <Building2 className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-widest">
                Hôtel
              </div>
              <div className="font-semibold text-gray-900">Informations</div>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <div className="text-gray-500">Nom</div>
              <div className="font-medium text-gray-900">{hotelName ?? "—"}</div>
            </div>

            

            <div>
              <div className="text-gray-500">Email</div>
              <div className="font-medium text-gray-900">{hotelEmail ?? "—"}</div>
            </div>

            <div>
              <div className="text-gray-500">Téléphone</div>
              <div className="font-medium text-gray-900">{hotelPhone ?? "—"}</div>
            </div>
          </div>

         
        </aside>
      </div>

      {/* ================= PASSWORD ================= */}
      <section className={card}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-widest">
              Sécurité
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Changer le mot de passe
            </h2>
          </div>
          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
            <Lock className="w-4 h-4 text-emerald-700" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <label className="space-y-1">
            <div className={label}>Mot de passe actuel</div>
            <input
              className={input}
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </label>

          <label className="space-y-1">
            <div className={label}>Nouveau mot de passe</div>
            <input
              className={input}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="text-[11px] text-gray-400">
              Minimum 8 caractères.
            </div>
          </label>

          <label className="space-y-1">
            <div className={label}>Confirmer</div>
            <input
              className={input}
              type="password"
              value={confirmNew}
              onChange={(e) => setConfirmNew(e.target.value)}
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <button className={btnPrimary} onClick={onChangePassword}>
            <Lock className="w-4 h-4" />
            Mettre à jour
          </button>
        </div>
      </section>
    </div>
  );
}
