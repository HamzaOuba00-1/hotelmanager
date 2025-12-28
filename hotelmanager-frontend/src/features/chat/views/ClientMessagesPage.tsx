import React, { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, RefreshCw } from "lucide-react";
import clsx from "clsx";

import {
  getOrCreateClientSupportChannel,
  getMessages,
  sendMessage,
} from "../../chat/api/channelsApi";

import type { Channel, ChatMessage } from "../Chat";

const card = "bg-white rounded-3xl border shadow-sm";
const soft = "bg-gray-50/60";
const input =
  "w-full border border-gray-200 px-3 py-2.5 rounded-xl bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm";
const btn =
  "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition";
const btnPrimary =
  `${btn} bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm`;
const btnGhost =
  `${btn} bg-white border hover:bg-gray-50`;

export default function ClientMessagesPage() {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);

  const loadSupport = async () => {
    setLoading(true);
    setErr(null);
    try {
      const c = await getOrCreateClientSupportChannel();
      setChannel(c);
      return c;
    } catch (e: any) {
      setErr(e?.message || "Impossible d’ouvrir la messagerie de l’hôtel.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (c: Channel) => {
    setLoadingMsgs(true);
    setErr(null);
    try {
      const msgs = await getMessages(c.id, 120);
      setMessages(msgs.slice().reverse());
    } catch (e: any) {
      setErr(e?.message || "Impossible de charger les messages.");
    } finally {
      setLoadingMsgs(false);
    }
  };

  useEffect(() => {
    (async () => {
      const c = await loadSupport();
      if (c) await loadMessages(c);
    })();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const refresh = async () => {
    if (!channel) {
      const c = await loadSupport();
      if (c) await loadMessages(c);
      return;
    }
    await loadMessages(channel);
  };

  const onSend = async () => {
    if (!draft.trim()) return;

    try {
      let c = channel;

      // ✅ sécurité UX : si channel pas encore chargé
      if (!c) {
        c = await loadSupport();
        if (!c) return;
      }

      const msg = await sendMessage(c.id, draft.trim());
      setMessages((prev) => [...prev, msg]);
      setDraft("");
    } catch (e: any) {
      setErr(e?.message || "Envoi impossible.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header premium */}
      <div className={clsx(card, "p-6")}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white grid place-items-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                Contacter l’hôtel
              </div>
              <div className="text-xs text-gray-500">
                Vous écrivez directement à l’équipe de direction.
              </div>
            </div>
          </div>

          <button className={btnGhost} onClick={refresh}>
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>

        {err && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm p-3">
            {err}
          </div>
        )}
      </div>

      {/* Chat panel */}
      <div className={clsx(card, "flex flex-col min-h-[520px] overflow-hidden")}>
        {/* mini header */}
        <div className="p-5 border-b">
          <div className="font-semibold text-gray-900">
            {channel?.name ?? "Conversation"}
          </div>
          <div className="text-xs text-gray-500">
            Discussion privée Client ↔ Managers
          </div>
        </div>

        {/* messages */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3">
          {loading && (
            <div className="text-sm text-gray-500">Ouverture du canal…</div>
          )}

          {!loading && loadingMsgs && (
            <div className="text-sm text-gray-500">Chargement des messages…</div>
          )}

          {!loading && !loadingMsgs && !messages.length && (
            <div className={clsx("rounded-2xl border p-6", soft)}>
              <div className="text-sm text-gray-700">
                Aucun message pour le moment.
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Décrivez votre demande, un manager vous répondra ici.
              </div>
            </div>
          )}

          {!loading && !loadingMsgs && messages.map((m) => (
            <div key={m.id} className="rounded-2xl border bg-white p-3">
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

          <div ref={endRef} />
        </div>

        {/* composer */}
        <div className="p-5 border-t">
          <div className="flex items-center gap-2">
            <input
              className={input}
              placeholder="Écrire un message… (Ctrl/Cmd+Entrée)"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  onSend();
                }
              }}
            />
            <button
              className={btnPrimary}
              onClick={onSend}
              disabled={!draft.trim()}
            >
              <Send className="w-4 h-4" />
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
