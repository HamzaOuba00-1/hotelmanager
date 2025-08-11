import React, { useEffect, useMemo, useState } from 'react';
import { Crew } from '../../../../types/Crew';
import { User } from '../../../../types/User';
import { getCrew, updateCrew, deleteCrew } from '../../../../api/crewApi';
import {
  Users, UserRoundPlus, PencilLine, Trash2, X, CheckCircle2,
  Shield, Hotel, Drill, Utensils, Martini , ConciergeBell, Bubbles, MonitorCog, HandCoins, DoorOpen, Loader2, ChefHat, Network, Bookmark
} from 'lucide-react';
import ConfirmModal from '../../../../common/ConfirmModal';

type Props = {
  crewId: number;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
  allUsers: User[];
};

const cardBase =
  "flex flex-col items-center justify-center w-36 h-36 p-5 rounded-3xl bg-white/60 backdrop-blur-xl " +
  "border border-white/30 shadow-[0_8px_24px_rgba(0,0,0,0.08)] ring-1 ring-white/20 " +
  "transition-transform duration-200 hover:scale-[1.03] hover:shadow-lg";

const chip =
  "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium " +
  "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";

const btnBase =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 transition " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500";
const btnGhost   = btnBase + " border border-white-300 text-white-700 hover:bg-gray-100";
const btnDanger  = btnBase + " border border-red-500 text-red-500 hover:bg-red-50";
const btnPrimary = btnBase + " text-white bg-gradient-to-br from-emerald-600 to-emerald-500 hover:shadow-lg";

const serviceIcon = (service?: Crew['service']) => {
  const cls = "w-4 h-4";
  switch (service) {
    case 'RECEPTION': return <Hotel className={cls} />;
    case 'HOUSEKEEPING': return <DoorOpen  className={cls} />;
    case 'MAINTENANCE': return <Drill  className={cls} />;
    case 'KITCHEN': return <ChefHat className={cls} />;
    case 'RESTAURANT': return <Utensils className={cls} />;
    case 'BAR': return <Martini className={cls} />;
    case 'CONCIERGE': return <ConciergeBell className={cls} />;
    case 'SPA': return <Bubbles className={cls} />;
    case 'SECURITY': return <Shield className={cls} />;
    case 'IT': return <MonitorCog  className={cls} />;
    case 'FINANCE': return <HandCoins className={cls} />;
    case 'HR': return <Network className={cls} />;
    default: return <Users className={cls} />;
  }
};

const CrewDetailsModal: React.FC<Props> = ({ crewId, onClose, onSaved, onDeleted, allUsers }) => {
  const [crew, setCrew] = useState<Crew | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // confirmations
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const usersById = useMemo(() => new Map(allUsers.map(u => [u.id, u])), [allUsers]);

  const load = async () => {
    setLoading(true);
    try {
      const c = await getCrew(crewId);
      setCrew(c);
      setName(c.name);
      setSelectedIds(c.members.map(m => m.id));
    } catch {
      setError('Impossible de charger le crew.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [crewId]);

  const toggle = (id: number) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const confirmSave = () => setShowConfirmSave(true);
  const confirmDelete = () => setShowConfirmDelete(true);

  // Option A: renvoyer aussi le service courant
  const doSave = async () => {
    if (!crew) return;
    setSaving(true); setError(null);
    try {
      await updateCrew(crew.id, { name, service: crew.service, memberIds: selectedIds });
      setEditMode(false);
      await load();
      onSaved();
    } catch {
      setError('Échec de la sauvegarde.');
    } finally {
      setSaving(false);
      setShowConfirmSave(false);
    }
  };

  const doDelete = async () => {
    if (!crew) return;
    try {
      await deleteCrew(crew.id);
      onDeleted();
      onClose();
    } catch {
      setError('Suppression impossible.');
    } finally {
      setShowConfirmDelete(false);
    }
  };

  const onBackdropClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4" onClick={onBackdropClick}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/20 shadow-2xl">

        {/* Header */}
        <header className="rounded-t-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center ring-1 ring-white/30 shadow">
                <Bookmark  className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white drop-shadow">
                  {editMode ? 'Modifier le Crew' : 'Détails du Crew'}
                </h2>
                <div className={chip}>
                  {serviceIcon(crew?.service)}
                  <span className="uppercase tracking-wider">{crew?.service ?? 'SERVICE'}</span>
                </div>
              </div>
            </div>

            {/* Actions header (≥ sm) */}
            {!editMode ? (
              <div className="hidden sm:flex items-center gap-2">
                <button className={btnGhost} onClick={() => setEditMode(true)}><PencilLine className="w-4 h-4" /> Modifier</button>
                <button className={btnDanger} onClick={confirmDelete}><Trash2 className="w-4 h-4" /> Supprimer</button>
                <button className={btnPrimary} onClick={onClose}><X className="w-4 h-4" /> Fermer</button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  className={btnGhost}
                  onClick={() => { if (!crew) return; setEditMode(false); setName(crew.name); setSelectedIds(crew.members.map(m => m.id)); }}
                ><X className="w-4 h-4" /> Annuler</button>
                <button className={btnPrimary} onClick={confirmSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Body */}
        <div className="bg-white/70 backdrop-blur-xl p-8">
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          {loading && <div className="text-sm text-gray-600">Chargement…</div>}

          {!loading && crew && (
            <>
              {/* Nom */}
              <div className="mb-6">
                <label className="block text-sm text-gray-600 mb-2">Nom du crew</label>
                {editMode ? (
                  <input
                    className="w-full rounded-xl border border-gray-300 bg-white/80 px-4 py-2.5 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Maintenance Nuit"
                  />
                ) : (
                  <div className="text-lg font-semibold text-gray-800">{crew.name}</div>
                )}
              </div>

              {/* Membres */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">Membres</span>
                  {!editMode && <span className="text-xs text-gray-500">{crew.memberCount} membres</span>}
                </div>

                {!editMode ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {crew.members.map(m => (
                      <div key={m.id} className={cardBase}>
                        <Users className="h-8 w-8 text-emerald-600 mb-2" />
                        <div className="text-sm font-semibold text-gray-800 text-center">{m.firstName} {m.lastName}</div>
                        <div className="text-[11px] text-gray-500 uppercase mt-1 tracking-widest">{m.role}</div>
                      </div>
                    ))}
                    {crew.members.length === 0 && <span className="text-sm text-gray-500">Aucun membre.</span>}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {allUsers.map(u => {
                      const active = selectedIds.includes(u.id);
                      return (
                        <button
                          type="button"
                          key={u.id}
                          onClick={() => toggle(u.id)}
                          className={`${cardBase} ${active ? 'bg-[#54f1a3] shadow-[0_8px_24px_rgba(71,184,129,0.20)]' : ''}`}
                          title={`${u.firstName} ${u.lastName}`}
                        >
                          <Users className="h-8 w-8 text-emerald-600 mb-2" />
                          <div className="text-sm font-semibold text-gray-800 text-center">{u.firstName} {u.lastName}</div>
                          <div className="text-[11px] text-gray-500 uppercase mt-1 tracking-widest">{u.role}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions bas — mobile uniquement */}
              <div className="mt-8 flex sm:hidden flex-col gap-3">
                {!editMode ? (
                  <>
                    <button className={btnDanger} onClick={confirmDelete}><Trash2 className="w-4 h-4" /> Supprimer</button>
                    <button className={btnGhost} onClick={() => setEditMode(true)}><PencilLine className="w-4 h-4" /> Modifier</button>
                    <button className={btnPrimary} onClick={onClose}><X className="w-4 h-4" /> Fermer</button>
                  </>
                ) : (
                  <>
                    <button className={btnGhost}
                      onClick={() => { if (!crew) return; setEditMode(false); setName(crew.name); setSelectedIds(crew.members.map(m => m.id)); }}>
                      <X className="w-4 h-4" /> Annuler
                    </button>
                    <button className={btnPrimary} onClick={confirmSave} disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {saving ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirmations */}
      <ConfirmModal
        open={showConfirmDelete}
        title="Confirmer la suppression"
        tone="danger"
        message={
          <div>
            Êtes-vous sûr de vouloir supprimer ce crew&nbsp;?
            <div className="mt-2 text-xs text-gray-500">Action irréversible.</div>
          </div>
        }
        confirmLabel="Supprime"
        onConfirm={doDelete}
        onClose={() => setShowConfirmDelete(false)}
      />

      <ConfirmModal
        open={showConfirmSave}
        title="Enregistrer les modifications"
        message={
          <div className="space-y-1">
            <div>Nom&nbsp;: <span className="font-medium">{name || '(vide)'}</span></div>
            <div>Membres sélectionnés&nbsp;: <span className="font-medium">{selectedIds.length}</span></div>
          </div>
        }
        confirmLabel="Enregistrer"
        onConfirm={doSave}
        onClose={() => setShowConfirmSave(false)}
        loading={saving}
      />
    </div>
  );
};

export default CrewDetailsModal;
