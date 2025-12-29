import React, { useEffect, useMemo, useState } from "react";
import {
  Save,
  User2,
  Lock,
  Mail,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "../../users/api/userApi";
import { getMyHotel } from "../../hotel/api/hotelApi";
import type { User } from "../../users/User";

/* ---------- Shared UI styles ---------- */
const card =
  "bg-white/70 backdrop-blur rounded-2xl border border-white/40 shadow-sm p-6";
const input =
  "w-full rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";
const label = "text-xs font-medium text-gray-500";
const btn =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition";
const btnPrimary = `${btn} bg-emerald-600 text-white hover:bg-emerald-700`;
const btnGhost = `${btn} border bg-white hover:bg-gray-50`;

export default function ClientProfilePage() {
  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------- Profile form ---------- */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  /* ---------- Password form ---------- */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");

  /* ---------- Hotel badge (optional display) ---------- */
  const [hotelName, setHotelName] = useState<string | undefined>();
  const [hotelLogo, setHotelLogo] = useState<string | undefined>();

  /* ---------- UI feedback ---------- */
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetAlerts = () => {
    setError(null);
    setSuccess(null);
  };

  /* ---------- Initial data loading ---------- */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        const [user, hotel] = await Promise.all([
          getMyProfile(),
          getMyHotel().catch(() => null),
        ]);

        if (!mounted) return;

        setMe(user);
        setFirstName(user.firstName ?? "");
        setLastName(user.lastName ?? "");
        setEmail(user.email ?? "");

        if (hotel) {
          setHotelName(hotel.name);
          setHotelLogo(hotel.logoUrl ?? undefined);
        }
      } catch (e: any) {
        if (!mounted) return;
        setError(
          e?.response?.data?.message ||
            e?.message ||
            "Unable to load profile."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* ---------- Detect profile changes ---------- */
  const infoChanged = useMemo(() => {
    if (!me) return false;
    return (
      firstName !== (me.firstName ?? "") ||
      lastName !== (me.lastName ?? "") ||
      email !== (me.email ?? "")
    );
  }, [me, firstName, lastName, email]);

  /* ---------- Save profile information ---------- */
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
      setSuccess("Profile updated successfully.");
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.response?.data?.detail ||
          e?.message ||
          "Update failed."
      );
    }
  };

  /* ---------- Change password ---------- */
  const onChangePassword = async () => {
    resetAlerts();

    if (!currentPassword || !newPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setError("The new password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmNew) {
      setError("Password confirmation does not match.");
      return;
    }

    try {
      await changeMyPassword(currentPassword, newPassword);
      setSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNew("");
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.response?.data?.detail ||
          e?.message ||
          "Password update failed."
      );
    }
  };

  if (loading) {
    return <div className="p-8 text-sm text-gray-500">Loading…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-gray-400">
            My space
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <User2 className="w-7 h-7 text-emerald-600" />
            Profile
          </h1>
        </div>

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
            <div className="text-sm font-medium text-gray-700">
              {hotelName}
            </div>
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm p-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm p-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {success}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal information */}
        <section className={card}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Personal Information
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="space-y-1">
              <div className={label}>First name</div>
              <input
                className={input}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </label>

            <label className="space-y-1">
              <div className={label}>Last name</div>
              <input
                className={input}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </label>

            <label className="space-y-1 sm:col-span-2">
              <div className={label}>Email</div>
              <input
                className={input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              className={btnGhost}
              disabled={!infoChanged}
              onClick={() => {
                resetAlerts();
                if (!me) return;
                setFirstName(me.firstName ?? "");
                setLastName(me.lastName ?? "");
                setEmail(me.email ?? "");
              }}
            >
              Reset
            </button>
            <button
              className={btnPrimary}
              disabled={!infoChanged}
              onClick={onSaveInfo}
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </section>

        {/* Security */}
        <section className={card}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Password & Security
          </h2>

          <div className="space-y-4">
            <label className="space-y-1">
              <div className={label}>Current password</div>
              <input
                className={input}
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </label>

            <label className="space-y-1">
              <div className={label}>New password</div>
              <input
                className={input}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <div className="text-[11px] text-gray-400">
                Minimum 8 characters.
              </div>
            </label>

            <label className="space-y-1">
              <div className={label}>Confirm password</div>
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
              Update password
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
