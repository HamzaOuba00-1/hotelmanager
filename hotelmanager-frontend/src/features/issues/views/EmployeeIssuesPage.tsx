import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  StarOff,
  Search as SearchIcon,
  Clock,
  User as UserIcon,
  Check,
  X,
  Trash2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import enUS from "date-fns/locale/en-US";
import {
  getIssuesForMyHotel,
  createIssue,
  deleteIssue,
  type Issue,
  type IssueStatus,
} from "../api/issueApi";

const useToast = () => {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  return { toast, showToast };
};

const statusLabel: Record<IssueStatus, string> = {
  OPEN: "Open",
  RESOLVED: "Resolved",
  DELETED: "Deleted",
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
    return format(d, "dd/MM/yyyy HH:mm", { locale: enUS });
  } catch {
    return iso;
  }
};

const EmployeeIssuesPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | IssueStatus>("");
  const [onlyImportant, setOnlyImportant] = useState(false);

  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const [detailsIssue, setDetailsIssue] = useState<Issue | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id?: number;
    title?: string;
  }>({ open: false });

  const { toast, showToast } = useToast();

  const loadIssues = async () => {
    setLoading(true);
    try {
      const { data } = await getIssuesForMyHotel();
      setIssues(data || []);
    } catch (e: any) {
      showToast(
        e?.response?.data?.detail ?? "Unable to load reported issues."
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
      .filter((issue) => {
        if (statusFilter && issue.status !== statusFilter) return false;
        if (onlyImportant && !issue.important) return false;
        if (!search.trim()) return true;

        const q = search.toLowerCase();
        return (
          issue.title.toLowerCase().includes(q) ||
          issue.description.toLowerCase().includes(q) ||
          (issue.createdByName || "").toLowerCase().includes(q)
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
      showToast("Title and description are required.");
      return;
    }

    try {
      setSubmitting(true);
      await createIssue({
        title: form.title.trim(),
        description: form.description.trim(),
        important: form.important,
      });
      showToast("Issue reported successfully");
      setForm(initialForm);
      await loadIssues();
    } catch (e: any) {
      showToast(
        e?.response?.data?.detail ?? "Unable to create the issue."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onDeleteIssue = async () => {
    if (!confirmDelete.id) return;

    try {
      await deleteIssue(confirmDelete.id);
      setConfirmDelete({ open: false });
      showToast("Issue deleted");
      await loadIssues();
    } catch (e: any) {
      showToast(
        e?.response?.data?.detail ?? "Unable to delete the issue."
      );
    }
  };

  return (
    <div className="p-6">
      {/* Page header presenting the issue reporting context */}
      <div className="flex flex-col items-center gap-2 mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-1">
          <AlertTriangle className="h-8 w-8 text-emerald-600" />
          My reported issues
        </h1>
        <p className="text-sm text-gray-500 max-w-2xl">
          Report operational problems observed within the hotel.
        </p>
      </div>

      {/* Quick issue creation form for employees */}
      <section className="bg-white/70 rounded-2xl border shadow p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-emerald-600" />
          New issue
        </h2>

        <form
          className="grid md:grid-cols-[1.1fr_2fr_auto] gap-3 items-start"
          onSubmit={onSubmitIssue}
        >
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="e.g. Water leak in room 305"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={2}
              placeholder="Describe the issue so management can act quickly…"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              required
            />
          </div>

          <div className="flex flex-col gap-2 items-stretch md:items-end">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                checked={form.important}
                onChange={(e) =>
                  setForm((f) => ({ ...f, important: e.target.checked }))
                }
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              Mark as important
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="mt-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm shadow hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              Submit
            </button>
          </div>
        </form>
      </section>

      {/* Filtering tools and quick statistics */}
      <section className="bg-white/60 rounded-2xl border shadow p-4 mb-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex items-center gap-2 bg-gray-50 border rounded-xl px-3 py-1.5 w-full md:w-72">
          <SearchIcon className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search issues..."
            className="flex-1 bg-transparent outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <select
            className="bg-gray-50 border rounded-xl px-3 py-1.5 text-sm outline-none"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter((e.target.value || "") as "" | IssueStatus)
            }
          >
            <option value="">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DELETED">Deleted</option>
          </select>

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
            Important
          </button>
        </div>
      </section>

      {/* Key metrics summarizing issue status */}
      <section className="grid sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-white/60 rounded-2xl border shadow p-4">
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Open
          </div>
          <div className="text-2xl font-bold mt-1">{stats.open}</div>
        </div>

        <div className="bg-white/60 rounded-2xl border shadow p-4">
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Resolved
          </div>
          <div className="text-2xl font-bold mt-1">{stats.resolved}</div>
        </div>

        <div className="bg-white/60 rounded-2xl border shadow p-4">
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Important
          </div>
          <div className="text-2xl font-bold mt-1">{stats.important}</div>
        </div>
      </section>

      {/* Main table listing hotel issues */}
      <section className="bg-white/60 rounded-2xl border shadow p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            Hotel issues
          </h2>
          <span className="text-xs text-gray-500">
            {filteredIssues.length} result(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 w-10"></th>
                <th className="py-2 w-1/4">Title</th>
                <th className="py-2 w-1/4">Description</th>
                <th className="py-2 w-28">Status</th>
                <th className="py-2 w-40">Author</th>
                <th className="py-2 w-40">Created at</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredIssues.length ? (
                filteredIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="border-b last:border-0 hover:bg-gray-50/60 cursor-pointer"
                    onClick={() => setDetailsIssue(issue)}
                  >
                    <td className="py-2 text-center w-10">
                      {issue.important && (
                        <Star className="w-4 h-4 text-yellow-500" />
                      )}
                    </td>

                    <td className="py-2 font-medium text-gray-800 align-top max-w-xs w-1/4">
                      <span className="block truncate">{issue.title}</span>
                    </td>

                    <td className="py-2 text-gray-600 align-top max-w-md w-2/5">
                      <div className="line-clamp-2 overflow-hidden">
                        {issue.description || "—"}
                      </div>
                    </td>

                    <td className="py-2 align-top w-28">
                      <StatusPill status={issue.status} />
                    </td>

                    <td className="py-2 text-gray-600 align-top w-40 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                        <span>{issue.createdByName || "Unknown"}</span>
                      </div>
                    </td>

                    <td className="py-2 text-gray-600 align-top w-40 whitespace-nowrap">
                      {formatDate(issue.createdAt)}
                    </td>

                    <td className="py-2 w-32 align-top">
                      {issue.status === "OPEN" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete({
                              open: true,
                              id: issue.id,
                              title: issue.title,
                            });
                          }}
                          className="px-2 py-1 rounded-lg border border-rose-200 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-4 text-center text-gray-500 text-sm"
                  >
                    No issues match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detailed view modal displaying full issue information */}
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
                Issue details
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
                    Created by{" "}
                    <b>{detailsIssue.createdByName || "Unknown"}</b>
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
                    Created on: <b>{formatDate(detailsIssue.createdAt)}</b>
                  </span>
                  {detailsIssue.resolvedAt && (
                    <span>
                      Resolved on:{" "}
                      <b>{formatDate(detailsIssue.resolvedAt)}</b>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setDetailsIssue(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation modal ensuring intentional deletion */}
      {confirmDelete.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/60 rounded-2xl shadow-xl p-6 w-full max-w-sm animate-fadeIn text-left">
            <h3 className="text-lg font-semibold mb-3">
              Delete this issue?
            </h3>
            <p className="text-sm text-gray-700 mb-5">
              This action will mark the issue as deleted.
              {confirmDelete.title && (
                <>
                  <br />
                  Issue: <b>{confirmDelete.title}</b>
                </>
              )}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete({ open: false })}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={onDeleteIssue}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-sm inline-flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightweight toast notification for user feedback */}
      {toast && (
        <div className="fixed bottom-6 right-6 px-5 py-3 rounded-lg bg-emerald-600 text-white shadow-xl animate-slideIn z-50">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" /> {toast}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn { animation: slideIn .35s ease-out; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn .25s ease-out; }
      `}</style>
    </div>
  );
};

export default EmployeeIssuesPage;
