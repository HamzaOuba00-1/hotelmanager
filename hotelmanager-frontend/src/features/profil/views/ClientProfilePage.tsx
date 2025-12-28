import React, { useEffect, useMemo, useState } from "react";
import { Save, User2, Lock, Mail, Phone, CheckCircle2, AlertTriangle } from "lucide-react";
import { getMyProfile, updateMyProfile, changeMyPassword } from "../../users/api/userApi";
import { getMyHotel } from "../../hotel/api/hotelApi";
import type { User } from "../../users/User";

const card =
  "bg-white/70 backdrop-blur rounded-2xl border border-white/40 shadow-sm p-6";
const input =
  "w-full rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-emerald-500";
const label = "text-xs font-medium text-gray-500";
const btn =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition";
const btnPrimary = `${btn} bg-emerald-600 text-white hover:bg-emerald-700`;
const btnGhost = `${btn} border bg-white hover:bg-gray-50`;

export default function ClientProfilePage() {
  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // form infos
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");

  // hotel display (optionnel mais élégant)
  const [hotelName, setHotelName] = useState<string | undefined>();
  const [hotelLogo, setHotelLogo] = useState<string | undefined>();

  // messages UI
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
        }
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.response?.data?.message || e?.message || "Impossible de charger le profil.");
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
      setOk("Profil mis à jour avec succès.");
    } catch (e: any) {
      setErr(
        e?.response?.data?.message ||
          e?.response?.data?.detail ||
          e?.message ||
          "Mise à jour impossible."
      );
    }
  };

  const onChangePassword = async () => {
    resetAlerts();

    if (!currentPassword || !newPassword) {
      setErr("Veuillez remplir tous les champs du mot de passe.");
      return;
    }
    if (newPassword.length < 8) {
      setErr("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (newPassword !== confirmNew) {
      setErr("La confirmation du mot de passe ne correspond pas.");
      return;
    }

    try {
      await changeMyPassword(currentPassword, newPassword);
      setOk("Mot de passe modifié.");
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
      {/* Header luxe sobre */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-gray-400">
            Mon espace
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <User2 className="w-7 h-7 text-emerald-600" />
            Profil
          </h1>
        </div>

        {/* mini badge hôtel */}
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
                <span className="text-[10px] text-gray-400">HOTEL</span>
              )}
            </div>
            <div className="text-sm font-medium text-gray-700">{hotelName}</div>
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ================== INFOS ================== */}
        <section className={card}>
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
                placeholder="Votre prénom"
              />
            </label>

            <label className="space-y-1">
              <div className={label}>Nom</div>
              <input
                className={input}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Votre nom"
              />
            </label>

            <label className="space-y-1 sm:col-span-2">
              <div className={label}>Email</div>
              <input
                className={input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@mail.com"
              />
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              className={btnGhost}
              onClick={() => {
                resetAlerts();
                if (!me) return;
                setFirstName(me.firstName ?? "");
                setLastName(me.lastName ?? "");
                setEmail(me.email ?? "");
              }}
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

        {/* ================== PASSWORD ================== */}
        <section className={card}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-widest">
                Sécurité
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Mot de passe
              </h2>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
              <Lock className="w-4 h-4 text-emerald-700" />
            </div>
          </div>

          <div className="space-y-4">
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
    </div>
  );
}
