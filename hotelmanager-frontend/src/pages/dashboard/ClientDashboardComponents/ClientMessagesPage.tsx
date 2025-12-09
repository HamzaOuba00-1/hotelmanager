import React, { JSX, useEffect, useMemo, useRef, useState } from "react";
import {
  MessageSquare,
  Search,
  Send,
  Megaphone,
  Hash,
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
  Sparkles,
  RefreshCw,
} from "lucide-react";
import clsx from "clsx";

import {
  listChannels,
  getMessages,
  sendMessage,
} from "../../../api/channelsApi";

import type { Channel, ChatMessage } from "../../../types/Chat";

/* -------------------- Styles (luxe simple) -------------------- */
const card = "bg-white rounded-3xl border shadow-sm";
const soft = "bg-gray-50/60";
const input =
  "w-full border border-gray-200 px-3 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm";
const btn =
  "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition";
const btnPrimary =
  `${btn} bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm`;
const btnGhost =
  `${btn} bg-white border hover:bg-gray-50`;

/* -------------------- Service icons -------------------- */
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
};

/* -------------------- Helpers -------------------- */
const iconForChannel = (c: Channel) => {
  if (c.type === "ANNOUNCEMENT") return <Megaphone className="w-4 h-4" />;
  if (c.type === "DIRECT") return <Hash className="w-4 h-4" />;
  if (c.service && listServiceIcon[c.service]) return listServiceIcon[c.service];
  return <MessageSquare className="w-4 h-4" />;
};

const labelType = (t?: string) => {
  if (t === "ANNOUNCEMENT") return "Annonces";
  if (t === "DIRECT") return "Conversation";
  if (t === "CREW") return "Service";
  return "Canal";
};

export default function ClientMessagesPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [active, setActive] = useState<Channel | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  const msgEndRef = useRef<HTMLDivElement | null>(null);

  const refreshChannels = async () => {
    setLoadingChannels(true);
    setErr(null);
    try {
      const data = await listChannels();
      setChannels(data);
      setActive((prev) => {
        if (!data.length) return null;
        if (prev) return data.find((c) => c.id === prev.id) ?? data[0];
        return data[0];
      });
    } catch (e: any) {
      setErr(e?.message || "Impossible de charger vos conversations.");
    } finally {
      setLoadingChannels(false);
    }
  };

  useEffect(() => {
    refreshChannels();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return channels;
    return channels.filter((c) => c.name.toLowerCase().includes(q));
  }, [channels, query]);

  useEffect(() => {
    (async () => {
      if (!active) {
        setMessages([]);
        return;
      }
      setLoadingMsgs(true);
      setErr(null);
      try {
        const msgs = await getMessages(active.id, 100);
        // backend renvoie desc, on remet dans l’ordre chronologique
        setMessages(msgs.slice().reverse());
      } catch (e: any) {
        setErr(e?.message || "Impossible de charger les messages.");
      } finally {
        setLoadingMsgs(false);
      }
    })();
  }, [active?.id]);

  useEffect(() => {
    // auto-scroll doux
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, active?.id]);

  const onSend = async () => {
    if (!active || !draft.trim()) return;
    try {
      const msg = await sendMessage(active.id, draft.trim());
      setMessages((prev) => [...prev, msg]);
      setDraft("");
    } catch (e: any) {
      setErr(e?.message || "Envoi impossible.");
    }
  };

  return (
    <div className="space-y-6">
      {/* -------------------- Header luxe simple -------------------- */}
      <div className={clsx(card, "p-6")}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white grid place-items-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                Messages avec l’hôtel
              </div>
              <div className="text-xs text-gray-500">
                Contactez la réception ou les services en toute simplicité.
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className={btnGhost} onClick={refreshChannels}>
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className={clsx(input, "pl-9")}
                placeholder="Rechercher une conversation…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {err && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm p-3">
            {err}
          </div>
        )}
      </div>

      {/* -------------------- Main layout -------------------- */}
      <section className="grid lg:grid-cols-[340px_1fr] gap-6">
        {/* -------------------- Left: channels list -------------------- */}
        <div className={clsx(card, "p-5")}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-gray-900">
              Vos conversations
            </div>
            <span className="text-[11px] text-gray-500">
              {filtered.length}
            </span>
          </div>

          <div className="grid gap-2 max-h-[62vh] overflow-y-auto pr-1">
            {loadingChannels && (
              <div className="text-sm text-gray-500">Chargement…</div>
            )}

            {!loadingChannels && filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c)}
                className={clsx(
                  "text-left rounded-2xl border p-4 transition hover:shadow-sm",
                  active?.id === c.id
                    ? "bg-emerald-50/60 border-emerald-200"
                    : "bg-white"
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="p-2 rounded-xl bg-gray-100">
                    {iconForChannel(c)}
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {c.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {labelType(c.type)}
                      {c.service ? ` • ${c.service}` : ""}
                      {" • "}
                      {c.memberCount} membre{c.memberCount > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {!loadingChannels && !filtered.length && (
              <div className={clsx("rounded-2xl border p-5", soft)}>
                <div className="flex items-center gap-2 text-gray-800 font-medium">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Aucune conversation disponible
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Un manager doit vous ajouter à une conversation
                  (ex: Réception) pour que vous puissiez échanger ici.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* -------------------- Right: chat thread -------------------- */}
        <div className={clsx(card, "p-0 flex flex-col min-h-[520px]")}>
          {/* Top of chat */}
          <div className="p-5 border-b">
            {active ? (
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-gray-100">
                  {iconForChannel(active)}
                </span>
                <div>
                  <div className="font-semibold text-gray-900">
                    {active.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {labelType(active.type)}
                    {active.service ? ` • ${active.service}` : ""}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Sélectionnez une conversation à gauche.
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3">
            {!active && (
              <div className={clsx("rounded-2xl border p-6", soft)}>
                <div className="text-sm text-gray-700">
                  Pour démarrer, choisissez une conversation.
                </div>
              </div>
            )}

            {active && loadingMsgs && (
              <div className="text-sm text-gray-500">
                Chargement des messages…
              </div>
            )}

            {active && !loadingMsgs && !messages.length && (
              <div className={clsx("rounded-2xl border p-6", soft)}>
                <div className="text-sm text-gray-700">
                  Aucun message pour le moment.
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Vous pouvez envoyer votre première demande ici.
                </div>
              </div>
            )}

            {active && !loadingMsgs && messages.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl border bg-white p-3"
              >
                <div className="text-[11px] text-gray-500">
                  <span className="font-medium text-gray-700">
                    {m.senderFirstName} {m.senderLastName}
                  </span>
                  {" • "}
                  {new Date(m.createdAt).toLocaleString()}
                </div>
                <div className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                  {m.content}
                </div>
              </div>
            ))}

            <div ref={msgEndRef} />
          </div>

          {/* Composer */}
          <div className="p-5 border-t">
            <div className="flex items-center gap-2">
              <input
                className={input}
                placeholder={
                  active
                    ? "Écrire un message… (Ctrl/Cmd+Entrée pour envoyer)"
                    : "Sélectionnez une conversation pour écrire"
                }
                disabled={!active}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (!active) return;
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    onSend();
                  }
                }}
              />
              <button
                className={btnPrimary}
                onClick={onSend}
                disabled={!active || !draft.trim()}
              >
                <Send className="w-4 h-4" />
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
