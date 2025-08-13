// src/pages/employee/EmployeeChatPage.tsx
import React, { JSX, useEffect, useMemo, useRef, useState } from "react";
import {
  MessageSquare, Users, Hash, Megaphone, Search, Send, X, Plus
} from "lucide-react";
import {
  listChannels, getMessages, sendMessage, createChannel, getChannelMembers
} from "../../../api/channelsApi";
import { getUsersFromMyHotel } from "../../../api/userApi";
import { getCrew } from "../../../api/crewApi";
import type { Channel, ChatMessage } from "../../../types/Chat";
import type { User } from "../../../types/User";

// ----- UI helpers -----
const card = "bg-white/60 rounded-2xl border shadow p-5";
const btn  = "inline-flex items-center gap-2 px-4 py-2 rounded-xl transition";
const btnPrimary = `${btn} bg-emerald-600 text-white hover:bg-emerald-700`;
const btnGhost   = `${btn} bg-white/80 border hover:shadow`;
const input = "w-full border border-gray-300 p-2 rounded-xl bg-white/80 focus:outline-none";

// ----- icônes services -----
const iconForChannel = (c: Channel) => {
  if (c.type === "ANNOUNCEMENT") return <Megaphone className="w-4 h-4" />;
  if (c.type === "DIRECT") return <Hash className="w-4 h-4" />;
  return <MessageSquare className="w-4 h-4" />;
};

// Helper "Prénom Nom"
const joinName = (fn?: string, ln?: string) =>
  `${fn ?? ""} ${ln ?? ""}`.trim().replace(/\s+/g, " ");

// ✅ type local compatible côté Crew (pas d’email requis ici)
type MemberLite = {
  id: number;
  firstName: string;
  lastName: string;
  role?: string;
};

type PickerMode = "crew" | "channel";

const EmployeeChatPage: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filtered, setFiltered] = useState<Channel[]>([]);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Channel | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingChannels, setLoadingChannels] = useState(false);

  // users (mapping id -> nom) si jamais senderFirst/Last manquent
  const [users, setUsers] = useState<User[]>([]);
  const usersById = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

  // Crew & membres
  const myCrewChannels = useMemo(
    () => channels.filter(c => c.type === "CREW"),
    [channels]
  );
  const selectedCrew = useMemo(
    () => (active?.type === "CREW" ? active : myCrewChannels[0] ?? null),
    [active, myCrewChannels]
  );
  const [crewMembers, setCrewMembers] = useState<MemberLite[]>([]);

  // Cache des membres par canal (pour le picker "channel")
  const [channelMembersCache, setChannelMembersCache] =
    useState<Map<number, MemberLite[]>>(new Map());

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(()=>setToast(null), 1800); };

  // Modal "Créer DM" (picker générique)
  const [dmPickerOpen, setDmPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<PickerMode>("crew");
  const [dmSearch, setDmSearch] = useState("");
  const [dmPick, setDmPick] = useState<MemberLite | null>(null);
  const [creatingDM, setCreatingDM] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Charger mes canaux + users
  const refresh = async () => {
    setLoadingChannels(true);
    try {
      const data = await listChannels();
      setChannels(data);
      setFiltered(prev => {
        const q = query.trim().toLowerCase();
        return !q ? data : data.filter(c => c.name.toLowerCase().includes(q));
      });
      setActive(a => a ? data.find(d => d.id === a.id) ?? data[0] ?? null : data[0] ?? null);
    } finally { setLoadingChannels(false); }
  };

  useEffect(() => {
    refresh();
    getUsersFromMyHotel().then(setUsers).catch(console.error);
  }, []);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    setFiltered(!q ? channels : channels.filter(c => c.name.toLowerCase().includes(q)));
  }, [query, channels]);

  // Messages du canal actif
  useEffect(() => {
    (async () => {
      if (!active) return;
      setLoadingMsgs(true);
      try {
        const msgs = await getMessages(active.id, 100);
        setMessages(msgs.slice().reverse());
      } finally { setLoadingMsgs(false); }
    })();
  }, [active?.id]);

  // Membres du crew (via channel.crewId)
  useEffect(() => {
    (async () => {
      if (!selectedCrew || selectedCrew.type !== "CREW") { setCrewMembers([]); return; }
      const crewId = (selectedCrew as any).crewId as number | undefined;
      if (!crewId) { setCrewMembers([]); return; }
      try {
        const crew = await getCrew(crewId);
        const mapped: MemberLite[] = (crew.members ?? []).map((m: any) => ({
          id: m.id, firstName: m.firstName, lastName: m.lastName, role: m.role
        }));
        setCrewMembers(mapped);
      } catch { setCrewMembers([]); }
    })();
  }, [selectedCrew?.id]);

  // Charger membres d'un canal générique dans le cache
  const ensureChannelMembers = async (c: Channel) => {
    if (channelMembersCache.has(c.id)) return;
    try {
      const list = await getChannelMembers(c.id); // User[]
      const mapped: MemberLite[] = (list ?? []).map((u: User) => ({
        id: u.id, firstName: u.firstName, lastName: u.lastName, role: u.role
      }));
      setChannelMembersCache(prev => {
        const next = new Map(prev);
        next.set(c.id, mapped);
        return next;
      });
    } catch (e) {
      // si c'est un CREW et que /channels/{id}/members n'existe pas, fallback déjà couvert via crewMembers
      setChannelMembersCache(prev => {
        const next = new Map(prev);
        next.set(c.id, []);
        return next;
      });
    }
  };

  const canWrite = (c?: Channel | null) =>
    !!c && (c.type === "DIRECT" || c.type === "CREW");

  const onSend = async () => {
    if (!active || !draft.trim() || !canWrite(active)) return;
    const msg = await sendMessage(active.id, draft.trim());
    setMessages(prev => [...prev, msg]);
    setDraft("");
    inputRef.current?.focus();
  };

  // (fallback) nom de l’auteur
  const displaySender = (m: ChatMessage) => {
    const full = joinName((m as any).senderFirstName, (m as any).senderLastName);
    if (full) return full;
    const sid = (m as any).senderId as number | undefined;
    if (sid && usersById.has(sid)) {
      const u = usersById.get(sid)!;
      return joinName(u.firstName, u.lastName) || u.email || "Utilisateur";
    }
    return "Utilisateur";
  };

  // Trouver un DM existant
  const findDMWith = (u: MemberLite) => {
    const fn = (u.firstName || "").toLowerCase();
    const ln = (u.lastName  || "").toLowerCase();
    return channels.find(c =>
      c.type === "DIRECT" &&
      c.name &&
      c.name.toLowerCase().includes(fn) &&
      c.name.toLowerCase().includes(ln)
    );
  };

  const openDMWith = (u: MemberLite) => {
    const existing = findDMWith(u);
    if (existing) {
      setActive(existing);
      setTimeout(()=>inputRef.current?.focus(), 0);
    } else {
      setDmPick(u);
      setDmPickerOpen(true);
    }
  };

  // Ouvrir le picker en mode CREW
  const openCrewPicker = () => {
    setPickerMode("crew");
    setDmPick(null);
    setDmSearch("");
    setDmPickerOpen(true);
  };

  // Ouvrir le picker en mode CHANNEL (membres du canal actif)
  const openChannelPicker = async () => {
    if (!active) return;
    await ensureChannelMembers(active);
    setPickerMode("channel");
    setDmPick(null);
    setDmSearch("");
    setDmPickerOpen(true);
  };

  const pickerMembers = useMemo(() => {
    const base: MemberLite[] =
      pickerMode === "channel"
        ? (active ? (channelMembersCache.get(active.id) ?? []) :
            [])
        : crewMembers;

    const q = dmSearch.trim().toLowerCase();
    if (!q) return base;
    return base.filter(m =>
      `${m.firstName ?? ""} ${m.lastName ?? ""}`.toLowerCase().includes(q)
    );
  }, [pickerMode, dmSearch, crewMembers, active, channelMembersCache]);

  const createDM = async () => {
    if (!dmPick) return;
    try {
      setCreatingDM(true);
      const created = await createChannel({
        type: "DIRECT",
        name: `DM • ${joinName(dmPick.firstName, dmPick.lastName)}`,
        memberIds: [dmPick.id] // le back ajoute l'utilisateur courant
      });
      setChannels(prev => [created, ...prev]);
      setFiltered(prev => [created, ...prev]);
      setActive(created);
      showToast("Conversation créée ✅");
      setDmPickerOpen(false);
      setDmPick(null);
      setTimeout(()=>inputRef.current?.focus(), 0);
    } catch (e:any) {
      showToast(e?.response?.data?.detail || "Création impossible");
    } finally {
      setCreatingDM(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-emerald-600" /> Messages
        </h1>

        {/* Recherche canaux */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className="pl-9 pr-3 py-2 rounded-xl border bg-white/80"
            placeholder="Rechercher un canal…"
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
          />
        </div>

        {/* Mes crews & membres + boutons */}
        {myCrewChannels.length > 0 && (
          <div className="w-full max-w-5xl flex flex-col items-center gap-2">
            <div className="text-xs text-gray-500">
              Mon crew : <b>{selectedCrew?.name ?? myCrewChannels[0]?.name}</b>
            </div>

            {!!crewMembers.length && (
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="text-xs text-gray-500">Contacter un membre :</span>

                {crewMembers.map(m => (
                  <button
                    key={m.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                    onClick={()=>openDMWith(m)}
                    title={joinName(m.firstName, m.lastName)}
                  >
                    <Users className="w-3.5 h-3.5" />
                    {joinName(m.firstName, m.lastName)}
                  </button>
                ))}

                {/* ➕ boutons pickers */}
                <button
                  className={`${btnGhost} !px-3 !py-1.5 text-xs`}
                  onClick={openCrewPicker}
                  title="Choisir dans mon crew"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Choisir dans mon crew
                </button>

                <button
                  className={`${btnGhost} !px-3 !py-1.5 text-xs`}
                  onClick={openChannelPicker}
                  title="Choisir parmi les membres du canal actif"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Contacter un membre du canal
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Layout */}
      <section className="grid lg:grid-cols-[360px_1fr] gap-6">
        {/* Liste canaux */}
        <div className={`${card}`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Mes canaux</h2>
            {loadingChannels && <span className="text-xs text-gray-500">Maj…</span>}
          </div>

          <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {filtered.map(c => (
              <div
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={()=>setActive(c)}
                onKeyDown={(e)=> e.key==='Enter' && setActive(c)}
                className={`w-full rounded-xl p-4 border transition hover:shadow cursor-pointer ${active?.id===c.id ? "bg-emerald-50/70 border-emerald-200" : "bg-white/70"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-gray-100">{iconForChannel(c)}</span>
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-gray-500">
                        {c.type} {c.service ? `• ${c.service}` : ""} • {c.memberCount} membres
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!filtered.length && <div className="text-sm text-gray-500">Aucun canal.</div>}
          </div>
        </div>

        {/* Chat */}
        <div className={`${card} min-h-[520px] flex flex-col`}>
          {active ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-gray-100">{iconForChannel(active)}</span>
                  <div>
                    <div className="font-semibold">{active.name}</div>
                    <div className="text-xs text-gray-500">
                      {active.type} {active.service ? `• ${active.service}` : ""}
                      {active.type === "ANNOUNCEMENT" ? " • lecture seule" : ""}
                    </div>
                  </div>
                </div>

                {/* Bouton rapide: membres du canal actif */}
                <button
                  className={`${btnGhost} text-xs`}
                  onClick={openChannelPicker}
                  title="Contacter un membre du canal"
                >
                  <Plus className="w-4 h-4" />
                  Contacter un membre du canal
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[60vh]">
                {loadingMsgs ? (
                  <div className="text-sm text-gray-500">Chargement des messages…</div>
                ) : messages.length ? (
                  messages.map(m => (
                    <div key={m.id} className="flex items-start gap-3 bg-white/80 border rounded-xl p-3">
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <Users className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          <span className="font-medium text-gray-700">
                            {joinName((m as any).senderFirstName, (m as any).senderLastName) || displaySender(m)}
                          </span>{" "}
                          • {new Date(m.createdAt).toLocaleString()}
                        </div>
                        <div className="whitespace-pre-wrap">
                          {m.softDeleted ? <em className="text-gray-400">message supprimé</em> : m.content}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">Aucun message pour l’instant.</div>
                )}
              </div>

              {/* Composer */}
              <div className="mt-4 flex items-center gap-2">
                <input
                  ref={inputRef}
                  className={`${input}`}
                  placeholder={canWrite(active) ? "Écrire un message… (Ctrl/Cmd+Entrée)" : "Canal en lecture seule"}
                  value={draft}
                  onChange={(e)=>setDraft(e.target.value)}
                  onKeyDown={(e)=>{ if (canWrite(active) && e.key === "Enter" && (e.ctrlKey || e.metaKey)) onSend(); }}
                  disabled={!canWrite(active)}
                />
                <button className={btnPrimary} onClick={onSend} disabled={!canWrite(active) || !draft.trim()}>
                  <Send className="w-4 h-4" /> Envoyer
                </button>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">Sélectionne un canal à gauche.</div>
          )}
        </div>
      </section>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 px-4 py-2 rounded-lg bg-gray-900 text-white shadow-lg text-sm flex items-center gap-2">
          <X className="w-4 h-4 opacity-50" /> {toast}
        </div>
      )}

      {/* Modal Picker (crew OU canal actif) */}
      {dmPickerOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          onClick={(e)=> e.currentTarget === e.target && setDmPickerOpen(false)}
        >
          <div
            className="bg-white/60 w-full max-w-lg rounded-2xl p-6 border shadow-xl animate-fadeIn"
            onClick={(e)=> e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {pickerMode === "crew" ? "Nouvelle conversation (mon crew)" : "Nouvelle conversation (membres du canal)"}
              </h3>
              <button className="p-2 rounded-lg hover:bg-gray-100" onClick={()=>setDmPickerOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-3 text-sm text-gray-600">
              {pickerMode === "crew"
                ? "Choisis un membre de ton crew."
                : "Choisis un membre appartenant au canal actif."}
            </div>

            <div className="relative mb-4">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                className="pl-9 pr-3 py-2 rounded-xl border bg-white/80 w-full"
                placeholder="Rechercher un membre…"
                value={dmSearch}
                onChange={(e)=>setDmSearch(e.target.value)}
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {pickerMembers.map(m => {
                const selected = dmPick?.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={()=>setDmPick(m)}
                    className={`w-full flex items-center justify-between rounded-xl border px-4 py-2 text-left ${selected ? "bg-emerald-50 border-emerald-200" : "bg-white/70 hover:bg-gray-50"}`}
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span className="font-medium">{joinName(m.firstName, m.lastName)}</span>
                    </span>
                    {selected && <span className="text-xs text-emerald-700">sélectionné</span>}
                  </button>
                );
              })}
              {!pickerMembers.length && (
                <div className="text-sm text-gray-500">Aucun membre.</div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button className={btnGhost} onClick={()=>setDmPickerOpen(false)}>
                <X className="w-4 h-4" /> Annuler
              </button>
              <button
                className={btnPrimary}
                onClick={createDM}
                disabled={!dmPick || creatingDM}
              >
                {creatingDM ? "Création…" : "Créer"}
              </button>
            </div>
          </div>

          <style>{`@keyframes fadeIn { from{opacity:.0;transform:translateY(8px)} to{opacity:1;transform:none} } .animate-fadeIn{animation:fadeIn .28s ease-out}`}</style>
        </div>
      )}
    </div>
  );
};

export default EmployeeChatPage;
