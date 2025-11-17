import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  Plus,
  Filter,
  Star,
  StarOff,
  Search as SearchIcon,
  Clock,
  User as UserIcon,
  Check,
  X,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import fr from "date-fns/locale/fr";
import {
  getIssuesForMyHotel,
  createIssue,
  updateIssueStatus,
  deleteIssue,
  type Issue,
  type IssueStatus,
} from "../../../api/issueApi";

// petit helper pour les toasts
const useToast = () => {
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };
  return { toast, showToast };
};

const statusLabel: Record<IssueStatus, string> = {
  OPEN: "Ouvert",
  RESOLVED: "Résolu",
  DELETED: "Supprimé",
};

const statusColors: Record<
  IssueStatus,
  { bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  OPEN: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
  RESOLVED: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  DELETED: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

const StatusPill: React.FC<{ status: IssueStatus }> = ({ status }) => {
  const cfg = statusColors[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {cfg.icon}
      {statusLabel[status]}
    </span>
  );
};

type FormState = {
  title: string;
  description: string;
  important: boolean;
};

const initialForm: FormState = {
  title: "",
  description: "",
  important: false,
};

const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    const d = parseISO(iso);
    return format(d, "dd/MM/yyyy HH:mm", { locale: fr });
  } catch {
    return iso;
  }
};

const IssuesPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | IssueStatus>("");
  const [onlyImportant, setOnlyImportant] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);

  const [confirmDel, setConfirmDel] = useState<{
    open: boolean;
    id?: number;
    title?: string;
  }>({ open: false });

  // 👉 nouveau : issue sélectionné pour le détail
  const [detailsIssue, setDetailsIssue] = useState<Issue | null>(null);

  const { toast, showToast } = useToast();

  const loadIssues = async () => {
    setLoading(true);
    try {
      const { data } = await getIssuesForMyHotel();
      setIssues(data || []);
    } catch (e: any) {
      console.error(e);
      showToast(
        e?.response?.data?.detail ??
          "Impossible de charger les signalements."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const filteredIssues = useMemo(() => {
    return issues
      .filter((iss) => {
        if (statusFilter && iss.status !== statusFilter) return false;
        if (onlyImportant && !iss.important) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          iss.title.toLowerCase().includes(q) ||
          iss.description.toLowerCase().includes(q) ||
          (iss.createdByName || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.id - a.id);
  }, [issues, search, statusFilter, onlyImportant]);

  const stats = useMemo(() => {
    const open = issues.filter((i) => i.status === "OPEN").length;
    const resolved = issues.filter((i) => i.status === "RESOLVED").length;
    const important = issues.filter((i) => i.important).length;
    return { open, resolved, important };
  }, [issues]);

  const onSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      showToast("Titre et description sont obligatoires.");
      return;
    }
    try {
      await createIssue({
        title: form.title.trim(),
        description: form.description.trim(),
        important: form.important,
      });
      showToast("Signalement créé ✅");
      setModalOpen(false);
      setForm(initialForm);
      await loadIssues();
    } catch (e: any) {
      console.error(e);
      showToast(
        e?.response?.data?.detail ?? "Impossible de créer le signalement."
      );
    }
  };

  const toggleImportant = async (issue: Issue) => {
    try {
      await updateIssueStatus(issue.id, { important: !issue.important });
      showToast(
        !issue.important
          ? "Signalement marqué comme important ⭐"
          : "Signalement marqué comme non important"
      );
      await loadIssues();
    } catch (e: any) {
      console.error(e);
      showToast(
        e?.response?.data?.detail ??
          "Impossible de mettre à jour l'importance."
      );
    }
  };

  const changeStatus = async (issue: Issue, next: IssueStatus) => {
    try {
      await updateIssueStatus(issue.id, { status: next });
      showToast(`Statut mis à jour (${statusLabel[next]}) ✅`);
      await loadIssues();
    } catch (e: any) {
      console.error(e);
      showToast(
        e?.response?.data?.detail ?? "Impossible de mettre à jour le statut."
      );
    }
  };

  const onDeleteIssue = async () => {
    if (!confirmDel.id) return;
    try {
      await deleteIssue(confirmDel.id);
      setConfirmDel({ open: false });
      showToast("Signalement supprimé 🗑️");
      await loadIssues();
    } catch (e: any) {
      console.error(e);
      showToast(
        e?.response?.data?.detail ?? "Impossible de supprimer le signalement."
      );
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-8 w-8 text-emerald-600" />
          <div className="text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Signalements de l’hôtel
            </h1>
            <p className="text-sm text-gray-500">
              Suivi des problèmes remontés par les équipes et les managers.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white shadow hover:bg-emerald-700 transition"
        >
          <Plus className="w-4 h-4" />
          Nouveau signalement
        </button>
      </div>

      {/* KPIs */}
      <section className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/60 rounded-2xl border shadow p-5">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Ouverts
          </div>
          <div className="text-3xl font-bold mt-1">{stats.open}</div>
          <p className="text-xs text-gray-500 mt-1">
            Signalements à traiter en priorité.
          </p>
        </div>

        <div className="bg-white/60 rounded-2xl border shadow p-5">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Résolus
          </div>
          <div className="text-3xl font-bold mt-1">{stats.resolved}</div>
          <p className="text-xs text-gray-500 mt-1">
            Problèmes déjà pris en charge.
          </p>
        </div>

        <div className="bg-white/60 rounded-2xl border shadow p-5">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Importants
          </div>
          <div className="text-3xl font-bold mt-1">{stats.important}</div>
          <p className="text-xs text-gray-500 mt-1">
            Marqués comme critiques par l’équipe.
          </p>
        </div>
      </section>

      {/* Filtres */}
      <section className="bg-white/60 rounded-2xl border shadow p-4 mb-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex items-center gap-2 bg-gray-50 border rounded-xl px-3 py-1.5 w-full md:w-72">
          <SearchIcon className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par titre, description, auteur..."
            className="flex-1 bg-transparent outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 bg-gray-50 border rounded-xl px-3 py-1.5">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              className="bg-transparent outline-none text-sm"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter((e.target.value || "") as "" | IssueStatus)
              }
            >
              <option value="">Tous les statuts</option>
              <option value="OPEN">Ouverts</option>
              <option value="RESOLVED">Résolus</option>
              <option value="DELETED">Supprimés</option>
            </select>
          </div>

          <button
            onClick={() => setOnlyImportant((v) => !v)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-sm transition ${
              onlyImportant
                ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                : "bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {onlyImportant ? (
              <Star className="w-4 h-4" />
            ) : (
              <StarOff className="w-4 h-4" />
            )}
            Importants
          </button>
        </div>
      </section>

      {/* Tableau */}
      <section className="bg-white/60 rounded-2xl border shadow p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            Liste des signalements
          </h2>
          <span className="text-xs text-gray-500">
            {filteredIssues.length} résultat(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 w-10"></th>
                <th className="py-2 w-1/5">Titre</th>
                <th className="py-2 w-1/4">Description</th>
                <th className="py-2 w-48">Statut</th>
                <th className="py-2 w-48">Auteur</th>
                <th className="py-2 w-48">Créé le</th>
                <th className="py-2 w-56">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-gray-500">
                    Chargement...
                  </td>
                </tr>
              ) : filteredIssues.length ? (
                filteredIssues.map((iss) => (
                  <tr
                    key={iss.id}
                    className="border-b last:border-0 hover:bg-gray-50/60 cursor-pointer"
                    onClick={() => setDetailsIssue(iss)} // 👈 ouvre les détails
                  >
                    {/* important star */}
                    <td className="py-2 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // ne pas ouvrir le modal
                          toggleImportant(iss);
                        }}
                        className="p-1 rounded-full hover:bg-gray-100"
                        title={
                          iss.important
                            ? "Retirer l'importance"
                            : "Marquer important"
                        }
                      >
                        {iss.important ? (
                          <Star className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <StarOff className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </td>

                    {/* 👉 Titre limité / tronqué */}
                    <td className="py-2 font-medium text-gray-800 align-top max-w-xs">
                      <span className="block truncate">{iss.title}</span>
                    </td>

                    {/* 👉 Description limitée (2 lignes max) */}
                    <td className="py-2 text-gray-600 align-top max-w-md">
                      <div className="line-clamp-2 overflow-hidden">
                        {iss.description || "—"}
                      </div>
                    </td>

                    <td className="py-2 align-top">
                      <StatusPill status={iss.status} />
                    </td>

                    <td className="py-2 text-gray-600 align-top">
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          {iss.createdByName || "Inconnu"}{" "}
                          {iss.createdById ? (
                            <span className="text-xs text-gray-400">
                              (#{iss.createdById})
                            </span>
                          ) : null}
                        </span>
                      </div>
                    </td>

                    <td className="py-2 text-gray-600 align-top">
                      {formatDate(iss.createdAt)}
                    </td>

                    <td className="py-2 align-top">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Bouton RESOLVED / REOPEN */}
                        {iss.status === "OPEN" ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              changeStatus(iss, "RESOLVED");
                            }}
                            className="px-2 py-1 rounded-lg border border-emerald-200 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 inline-flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Résoudre
                          </button>
                        ) : iss.status === "RESOLVED" ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              changeStatus(iss, "OPEN");
                            }}
                            className="px-2 py-1 rounded-lg border border-gray-200 text-xs text-gray-700 bg-white hover:bg-gray-100 inline-flex items-center gap-1"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            Rouvrir
                          </button>
                        ) : null}

                        {/* Soft delete */}
                        {iss.status !== "DELETED" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDel({
                                open: true,
                                id: iss.id,
                                title: iss.title,
                              });
                            }}
                            className="px-2 py-1 rounded-lg border border-rose-200 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Supprimer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-4 text-center text-gray-500 text-sm"
                  >
                    Aucun signalement ne correspond aux filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal création issue */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/60 rounded-2xl shadow-xl p-8 w-full max-w-lg animate-fadeIn text-left">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-emerald-600" />
                Nouveau signalement
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSubmitIssue} className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Titre
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                  className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ex : Fuite d'eau chambre 305"
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Description
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  required
                  rows={4}
                  className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  placeholder="Détaille le problème pour que le manager puisse agir rapidement…"
                />
              </label>

              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={form.important}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, important: e.target.checked }))
                  }
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                Marquer comme important
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
                >
                  Créer le signalement
                </button>
              </div>
            </form>
          </div>

          <style>{`
            @keyframes fadeIn { from { opacity:0; transform: translateY(8px);} to { opacity:1; transform: translateY(0);} }
            .animate-fadeIn { animation: fadeIn .25s ease-out; }
          `}</style>
        </div>
      )}

      {/* Modal DÉTAILS issue */}
      {detailsIssue && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setDetailsIssue(null)}
        >
          <div
            className="bg-white/60 rounded-2xl shadow-xl p-8 w-full max-w-xl animate-fadeIn text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-emerald-600" />
                Détails du signalement
              </h2>
              <button
                onClick={() => setDetailsIssue(null)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <div className="font-semibold text-gray-900 text-lg">
                  {detailsIssue.title}
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status={detailsIssue.status} />
                  {detailsIssue.important && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-50 text-yellow-700 border border-yellow-200">
                      <Star className="w-3.5 h-3.5" />
                      Important
                    </span>
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {detailsIssue.description}
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600 mt-2">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span>
                    Créé par{" "}
                    <b>{detailsIssue.createdByName || "Inconnu"}</b>
                    {detailsIssue.createdById && (
                      <span className="text-xs text-gray-400">
                        {" "}
                        (#{detailsIssue.createdById})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span>
                    Créé le :{" "}
                    <b>{formatDate(detailsIssue.createdAt)}</b>
                  </span>
                  {detailsIssue.resolvedAt && (
                    <span>
                      Résolu le :{" "}
                      <b>{formatDate(detailsIssue.resolvedAt)}</b>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDetailsIssue(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm"
              >
                Fermer
              </button>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn { from { opacity:0; transform: translateY(8px);} to { opacity:1; transform: translateY(0);} }
            .animate-fadeIn { animation: fadeIn .25s ease-out; }
          `}</style>
        </div>
      )}

      {/* Modal confirmation suppression */}
      {confirmDel.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/60 rounded-2xl shadow-xl p-6 w-full max-w-sm animate-fadeIn text-left">
            <h3 className="text-lg font-semibold mb-3">
              Supprimer ce signalement ?
            </h3>
            <p className="text-sm text-gray-700 mb-5">
              Cette action le marquera comme supprimé (soft delete).
              {confirmDel.title ? (
                <>
                  <br />
                  Signalement : <b>{confirmDel.title}</b>
                </>
              ) : null}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDel({ open: false })}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm"
              >
                Annuler
              </button>
              <button
                onClick={onDeleteIssue}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-sm inline-flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
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

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slideIn { animation: slideIn .35s ease-out; }
      `}</style>
    </div>
  );
};

export default IssuesPage;
