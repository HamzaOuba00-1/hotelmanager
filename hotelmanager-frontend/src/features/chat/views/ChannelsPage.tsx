import React, { JSX, useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  Plus,
  Users,
  Hash,
  Megaphone,
  Edit2,
  Trash2,
  Send,
  Search,
  X,
  EllipsisVertical,
  Hotel,
  UsersRound,
  Wrench,
  Utensils,
  Coffee,
  ConciergeBell,
  Bath,
  Shield,
  Cpu,
  HandCoins,
  Shield as ShieldLine,
  Hotel as HotelLine,
  Drill,
  Utensils as UtensilsLine,
  Martini,
  ConciergeBell as ConciergeLine,
  Bath as Bubbles,
  MonitorCog,
  HandCoins as HandCoinsLine,
  DoorOpen,
  ChefHat,
  Network,
} from "lucide-react";
import {
  listChannels,
  createChannel,
  deleteChannel,
  getMessages,
  sendMessage,
  updateChannel,
  replaceChannelMembers,
  getChannelMembers,
} from "../../../api/channelsApi";
import type { Channel, ChannelType, ChatMessage } from "../Chat";
import type { User } from "../../users/User";
import { getUsersFromMyHotel } from "../../../api/userApi";
import { getCrew, getCrews } from "../../users/api/crewApi";
import ConfirmModal from "../../../shared/components/ConfirmModal";
import clsx from "clsx";


const card = "bg-white/60 rounded-2xl border shadow p-5";
const btn = "inline-flex items-center gap-2 px-4 py-2 rounded-xl transition";
const btnPrimary = `${btn} bg-emerald-600 text-white hover:bg-emerald-700`;
const btnGhost = `${btn} bg-white/80 border hover:shadow`;
const input =
  "w-full border border-gray-300 p-2 rounded-xl bg-white/80 focus:outline-none";

const listServiceIcon: Record<string, JSX.Element> = {
  RECEPTION: <Hotel className="w-4 h-4" />,
  HOUSEKEEPING: <UsersRound className="w-4 h-4" />,
  MAINTENANCE: <Wrench className="w-4 h-4" />,
  KITCHEN: <Utensils className="w-4 h-4" />,
  RESTAURANT: <Utensils className="w-4 h-4" />,
  BAR: <Coffee className="w-4 h-4" />,
  CONCIERGE: <ConciergeBell className="w-4 h-4" />,
  SPA: <Bath className="w-4 h-4" />,
  SECURITY: <Shield className="w-4 h-4" />,
  IT: <Cpu className="w-4 h-4" />,
  FINANCE: <HandCoins className="w-4 h-4" />,
  HR: <Users className="w-4 h-4" />,
};

type CrewLite = { id: number; name: string; service?: string };

const crewTileServiceIcon = (service?: string) => {
  const cls = "w-8 h-8 text-emerald-600 mb-2";
  switch (service) {
    case "RECEPTION":
      return <HotelLine className={cls} />;
    case "HOUSEKEEPING":
      return <DoorOpen className={cls} />;
    case "MAINTENANCE":
      return <Drill className={cls} />;
    case "KITCHEN":
      return <ChefHat className={cls} />;
    case "RESTAURANT":
      return <UtensilsLine className={cls} />;
    case "BAR":
      return <Martini className={cls} />;
    case "CONCIERGE":
      return <ConciergeLine className={cls} />;
    case "SPA":
      return <Bubbles className={cls} />;
    case "SECURITY":
      return <ShieldLine className={cls} />;
    case "IT":
      return <MonitorCog className={cls} />;
    case "FINANCE":
      return <HandCoinsLine className={cls} />;
    case "HR":
      return <Network className={cls} />;
    default:
      return <Users className={cls} />;
  }
};

const tileBase =
  "flex flex-col items-center justify-center w-36 h-36 p-5 rounded-3xl " +
  "bg-white/60 backdrop-blur-xl border border-white/30 shadow ring-1 ring-white/20 " +
  "transition hover:scale-105";

const SelectTile: React.FC<{
  title: string;
  subtitle?: string;
  active?: boolean;
  onClick?: () => void;
  icon?: JSX.Element;
}> = ({ title, subtitle, active, onClick, icon }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    className={clsx(
      tileBase,
      "cursor-pointer m-0.5",
      active
        ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200"
        : ""
    )}
    title={title}
  >
    {icon ?? <Users className="w-8 h-8 text-emerald-600 mb-2" />}
    <div className="text-sm font-semibold text-center">{title}</div>
    {subtitle && (
      <div className="text-[11px] text-gray-500 uppercase tracking-widest">
        {subtitle}
      </div>
    )}
  </div>
);

const CreateChannelModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onCreated: (c: Channel) => void;
  users: User[];
  crews: CrewLite[];
}> = ({ open, onClose, onCreated, users, crews }) => {
  const [type, setType] = useState<ChannelType>("CREW");
  const [name, setName] = useState("");
  const [service, setService] = useState("RECEPTION");
  const [memberIds, setMemberIds] = useState<number[]>([]);
  const [crewId, setCrewId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setType("CREW");
    setName("");
    setService("RECEPTION");
    setMemberIds([]);
    setCrewId(undefined);
  }, [open]);

  // toggle et pick
  const toggleMember = (id: number) =>
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const pickCrew = (c: CrewLite) => {
    setCrewId(c.id);
    if (c.service) setService(c.service); // auto-fill service
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={(e) => e.currentTarget === e.target && onClose()}
    >
      <div
        className="bg-white/60 w-full max-w-4xl rounded-3xl p-0 border shadow-xl animate-fadeIn overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="p-6 border-b overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              Créer une chaîne
            </h2>
            <button
              className="p-2 rounded-lg hover:bg-gray-100"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* body scrollable */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-medium sm:col-span-1">
              Type
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ChannelType)}
                className={`${input} mt-1`}
              >
                <option value="CREW">Crew</option>
                <option value="DIRECT">Direct</option>
                <option value="ANNOUNCEMENT">Annonce</option>
              </select>
            </label>

            <label className="text-sm font-medium sm:col-span-1">
              Nom
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Housekeeping nuit"
                className={`${input} mt-1`}
              />
            </label>

            <label className="text-sm font-medium sm:col-span-1">
              Service (optionnel)
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className={`${input} mt-1`}
              >
                {Object.keys(listServiceIcon).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* CREW : tuiles avec icônes */}
          {type === "CREW" && (
            <div className="mt-6">
              <div className="text-sm text-gray-600 mb-2">
                Sélectionner un crew
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 max-h-[260px] overflow-y-auto px-2 py-2">
                {crews.length ? (
                  crews.map((c) => (
                    <SelectTile
                      key={c.id}
                      title={c.name}
                      subtitle={c.service ?? "—"}
                      active={crewId === c.id}
                      onClick={() => pickCrew(c)}
                      icon={crewTileServiceIcon(c.service)}
                    />
                  ))
                ) : (
                  <div className="text-sm text-amber-600">
                    Aucun crew — crée d’abord un crew.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DIRECT/ANNOUNCEMENT : membres en tuiles */}
          {(type === "DIRECT" || type === "ANNOUNCEMENT") && (
            <div className="mt-6">
              <div className="text-sm text-gray-600 mb-2">
                Sélection des membres
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 max-h-[260px] overflow-y-auto px-2 py-2">
                {users.map((u) => (
                  <SelectTile
                    key={u.id}
                    title={`${u.firstName} ${u.lastName}`}
                    subtitle={u.role}
                    active={memberIds.includes(Number(u.id))}
                    onClick={() => toggleMember(Number(u.id))}
                    icon={<Users className="w-8 h-8 text-emerald-600 mb-2" />}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="p-6 border-t overflow-y-auto flex justify-end gap-3">
          <button className={btnGhost} onClick={onClose}>
            <X className="w-4 h-4" /> Annuler
          </button>
          <button
            className={btnPrimary}
            disabled={!name.trim() || (type === "CREW" && !crewId) || loading}
            onClick={async () => {
              try {
                setLoading(true);
                const created = await createChannel({
                  type,
                  name,
                  service,
                  crewId: type === "CREW" ? crewId : undefined,
                  memberIds:
                    type !== "CREW" && memberIds.length ? memberIds : undefined,
                });
                onCreated(created);
                onClose();
              } catch (e: any) {
                alert(
                  e?.response?.data?.detail ||
                    e?.response?.data?.message ||
                    "Création impossible"
                );
              } finally {
                setLoading(false);
              }
            }}
          >
            <Plus className="w-4 h-4" /> {loading ? "Création…" : "Créer"}
          </button>
        </div>
      </div>

      <style>{`@keyframes fadeIn { from{opacity:.0;transform:translateY(8px)} to{opacity:1;transform:none} } .animate-fadeIn{animation:fadeIn .28s ease-out}`}</style>
    </div>
  );
};

const ChannelSettingsModal: React.FC<{
  open: boolean;
  channel: Channel | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
  users: User[];
}> = ({ open, channel, onClose, onSaved, onDeleted, users }) => {
  const [name, setName] = useState("");
  const [service, setService] = useState<string | undefined>(undefined);
  const [icon, setIcon] = useState<string | undefined>(undefined);
  const [memberIds, setMemberIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const isCrew = channel?.type === "CREW";
  const canEditMembers =
    channel?.type === "DIRECT" || channel?.type === "ANNOUNCEMENT";

  useEffect(() => {
    if (open && channel) {
      setName(channel.name);
      setService(channel.service ?? undefined);
      setIcon(channel.icon ?? undefined);
      setMemberIds([]);
    }
  }, [open, channel]);
  useEffect(() => {
    (async () => {
      if (!open || !channel) return;

      setName(channel.name);
      setService(channel.service ?? undefined);
      setIcon(channel.icon ?? undefined);
      setMemberIds([]);

      try {
        if (channel.type === "DIRECT" || channel.type === "ANNOUNCEMENT") {
          if (channel.crewId) {
            const crew = await getCrew(channel.crewId);
            setMemberIds(crew.members.map((m) => m.id));
          }
        }
      } catch (e) {
        console.error("Impossible de charger les membres", e);
      }
    })();
  }, [open, channel]);

  const toggle = (id: number) =>
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!open || !channel) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
        onClick={(e) => e.currentTarget === e.target && onClose()}
      >
        <div
          className="bg-white/60 w-full max-w-3xl rounded-3xl p-8 border shadow-xl animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              Détails du canal
            </h2>
            <button
              className="p-2 rounded-lg hover:bg-gray-100"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-medium sm:col-span-1">
              Nom
              <input
                className={`${input} mt-1`}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label className="text-sm font-medium sm:col-span-2">
              Service
              <select
                className={`${input} mt-1`}
                value={service ?? ""}
                onChange={(e) => setService(e.target.value || undefined)}
              >
                <option value="">—</option>
                {Object.keys(listServiceIcon).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <div>
              Type : <b>{channel.type}</b>{" "}
              {channel.service ? (
                <>
                  • Service : <b>{channel.service}</b>
                </>
              ) : null}
            </div>
            {isCrew && (
              <div className="text-xs text-gray-500 mt-1">
                Canal lié à un crew — la gestion des membres se fait via le
                crew.
              </div>
            )}
          </div>

          {canEditMembers && (
            <div className="mt-6">
              <div className="text-sm text-gray-600 mb-2">
                Membres (remplacement complet)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 max-h-[260px] overflow-y-auto px-2 py-2">
                {users.map((u) => {
                  const active = memberIds.includes(u.id); // ✅ sera vrai pour les membres existants
                  return (
                    <div
                      key={u.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => toggle(u.id)}
                      onKeyDown={(e) => e.key === "Enter" && toggle(u.id)}
                      className={clsx(
                        tileBase,
                        "cursor-pointer m-0.5",
                        active ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200" : ""
                      )}
                      title={`${u.firstName} ${u.lastName}`}
                    >
                      <Users className="w-8 h-8 text-emerald-600 mb-2" />
                      <div className="text-sm font-semibold text-center">
                        {u.firstName} {u.lastName}
                      </div>
                      <div className="text-[11px] text-gray-500 uppercase tracking-widest">
                        {u.role}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Si tu laisses la sélection telle quelle, les membres resteront
                identiques.
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="w-4 h-4" /> Supprimer le canal
            </button>

            <div className="flex gap-3">
              <button className={btnGhost} onClick={onClose}>
                <X className="w-4 h-4" /> Fermer
              </button>
              <button
                className={btnPrimary}
                onClick={() => setConfirmSave(true)}
                disabled={!name.trim() || saving}
              >
                <Edit2 className="w-4 h-4" />{" "}
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>

        <style>{`@keyframes fadeIn { from{opacity:.0;transform:translateY(8px)} to{opacity:1;transform:none} } .animate-fadeIn{animation:fadeIn .28s ease-out}`}</style>
      </div>

      {/* Confirm save */}
      <ConfirmModal
        open={confirmSave}
        title="Enregistrer les modifications ?"
        message="Confirme l’enregistrement des informations du canal."
        confirmLabel="Enregistrer"
        onClose={() => setConfirmSave(false)}
        onConfirm={async () => {
          if (!channel) return;
          try {
            setSaving(true);
            await updateChannel(channel.id, {
              name: name.trim(),
              service: service || undefined,
              icon: icon || undefined,
            });
            if (
              (channel.type === "DIRECT" || channel.type === "ANNOUNCEMENT") &&
              memberIds.length
            ) {
              await replaceChannelMembers(channel.id, memberIds);
            }
            setConfirmSave(false);
            onSaved();
            onClose();
          } finally {
            setSaving(false);
          }
        }}
      />

      {/* Confirm delete */}
      <ConfirmModal
        open={confirmDelete}
        tone="danger"
        title="Supprimer ce canal ?"
        message={
          <>
            Cette action est irréversible. Canal : <b>{channel?.name}</b>.
          </>
        }
        confirmLabel="Supprimer"
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          if (!channel) return;
          await deleteChannel(channel.id); // supprime en DB
          setConfirmDelete(false);
          onDeleted();
          onClose();
        }}
      />
    </>
  );
};

// ===================== PAGE =====================
const ChannelsPage: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filtered, setFiltered] = useState<Channel[]>([]);
  const [query, setQuery] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [crews, setCrews] = useState<CrewLite[]>([]);
  const [active, setActive] = useState<Channel | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const [openSettings, setOpenSettings] = useState(false);

  const [confirmListDelete, setConfirmListDelete] = useState<{
    open: boolean;
    channel?: Channel;
  }>({ open: false });
  const askDeleteFromList = (c: Channel) =>
    setConfirmListDelete({ open: true, channel: c });
  const confirmDeleteFromList = async () => {
    if (!confirmListDelete.channel) return;
    await deleteChannel(confirmListDelete.channel.id);
    setConfirmListDelete({ open: false });
    if (active?.id === confirmListDelete.channel.id) setActive(null);
    await refresh();
  };

  const refresh = async () => {
    const data = await listChannels();
    setChannels(data);
    setFiltered((prev) => {
      const q = query.trim().toLowerCase();
      return !q ? data : data.filter((c) => c.name.toLowerCase().includes(q));
    });
    if (active) {
      const again = data.find((c) => c.id === active.id);
      setActive(again ?? data[0] ?? null);
    } else if (data.length) {
      setActive(data[0]);
    }
  };

  useEffect(() => {
    refresh();
    getUsersFromMyHotel().then(setUsers).catch(console.error);
    getCrews()
      .then((all: any[]) =>
        setCrews(
          all.map((c) => ({ id: c.id, name: c.name, service: c.service }))
        )
      )
      .catch((e) => console.error("Impossible de charger les crews", e));
  }, []);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    setFiltered(
      !q ? channels : channels.filter((c) => c.name.toLowerCase().includes(q))
    );
  }, [query, channels]);

  useEffect(() => {
    (async () => {
      if (!active) return;
      setLoadingMsgs(true);
      try {
        const msgs = await getMessages(active.id, 100);
        setMessages(msgs.slice().reverse());
      } finally {
        setLoadingMsgs(false);
      }
    })();
  }, [active?.id]);

  const iconForChannel = (c: Channel) => {
    if (c.type === "ANNOUNCEMENT") return <Megaphone className="w-4 h-4" />;
    if (c.type === "DIRECT") return <Hash className="w-4 h-4" />;
    if (c.service && listServiceIcon[c.service])
      return listServiceIcon[c.service];
    return <MessageSquare className="w-4 h-4" />;
  };

  const onSend = async () => {
    if (!active || !draft.trim()) return;
    const msg = await sendMessage(active.id, draft.trim());
    setMessages((prev) => [...prev, msg]);
    setDraft("");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-emerald-600" /> Chaînes de
          communication
        </h1>
        <div className="flex gap-2">
          <button className={btnPrimary} onClick={() => setOpenCreate(true)}>
            <Plus className="w-4 h-4" /> Créer
          </button>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className="pl-9 pr-3 py-2 rounded-xl border bg-white/80"
              placeholder="Rechercher une chaîne…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Layout */}
      <section className="grid lg:grid-cols-[360px_1fr] gap-6">
        {/* Liste (scroll) */}
        <div className={`${card}`}>
          <h2 className="font-semibold mb-3">Mes chaînes</h2>
          <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {filtered.map((c) => (
              <div
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => setActive(c)}
                onKeyDown={(e) => e.key === "Enter" && setActive(c)}
                className={`w-full rounded-xl p-4 border transition hover:shadow cursor-pointer ${
                  active?.id === c.id
                    ? "bg-emerald-50/70 border-emerald-200"
                    : "bg-white/70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-gray-100">
                      {iconForChannel(c)}
                    </span>
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-gray-500">
                        {c.type} {c.service ? `• ${c.service}` : ""} •{" "}
                        {c.memberCount} membres
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Renommer -> ouvre la modale d'édition (comme ⋮) */}
                    <button
                      className="p-2 rounded-lg hover:bg-gray-100"
                      title="Modifier"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActive(c);
                        setOpenSettings(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg hover:bg-rose-50"
                      title="Supprimer"
                      onClick={(e) => {
                        e.stopPropagation();
                        askDeleteFromList(c);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!filtered.length && (
              <div className="text-sm text-gray-500">Aucune chaîne.</div>
            )}
          </div>
        </div>

        {/* Chat (scroll) */}
        <div className={`${card} min-h-[520px] flex flex-col`}>
          {active ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-gray-100">
                    {iconForChannel(active)}
                  </span>
                  <div>
                    <div className="font-semibold">{active.name}</div>
                    <div className="text-xs text-gray-500">
                      {active.type}{" "}
                      {active.service ? `• ${active.service}` : ""}
                    </div>
                  </div>
                </div>

                {/* ⋮ ouvre la même modale d'édition */}
                <button
                  className="p-2 rounded-lg hover:bg-gray-100"
                  title="Infos / Réglages"
                  onClick={() => setOpenSettings(true)}
                >
                  <EllipsisVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[60vh]">
                {loadingMsgs ? (
                  <div className="text-sm text-gray-500">
                    Chargement des messages…
                  </div>
                ) : messages.length ? (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-start gap-3 bg-white/80 border rounded-xl p-3"
                    >
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <Users className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        {/* ⬇️ CHANGEMENT ICI : affiche nom + prénom + date */}
                        <div className="text-xs text-gray-500">
                          <span className="font-medium text-gray-700">
                            {m.senderFirstName} {m.senderLastName}
                          </span>{" "}
                          • {new Date(m.createdAt).toLocaleString()}
                        </div>

                        <div className="whitespace-pre-wrap">{m.content}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">
                    Aucun message pour l’instant.
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <input
                  className={`${input}`}
                  placeholder="Écrire un message… (Ctrl/Cmd+Entrée pour envoyer)"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onSend();
                  }}
                />
                <button className={btnPrimary} onClick={onSend}>
                  <Send className="w-4 h-4" /> Envoyer
                </button>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">
              Sélectionne une chaîne à gauche.
            </div>
          )}
        </div>
      </section>

      {/* Modales */}
      <CreateChannelModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={(c) => {
          setChannels((prev) => [c, ...prev]);
          setFiltered((prev) => [c, ...prev]);
          setActive(c);
        }}
        users={users}
        crews={crews}
      />

      <ChannelSettingsModal
        open={openSettings}
        channel={active}
        onClose={() => setOpenSettings(false)}
        onSaved={refresh}
        onDeleted={refresh}
        users={users}
      />

      {/* Confirm delete (depuis la liste) */}
      <ConfirmModal
        open={confirmListDelete.open}
        tone="danger"
        title="Supprimer ce canal ?"
        message={
          <>
            Cette action est irréversible. Canal :{" "}
            <b>{confirmListDelete.channel?.name}</b>.
          </>
        }
        confirmLabel="Supprimer"
        onClose={() => setConfirmListDelete({ open: false })}
        onConfirm={confirmDeleteFromList}
      />
    </div>
  );
};

export default ChannelsPage;
