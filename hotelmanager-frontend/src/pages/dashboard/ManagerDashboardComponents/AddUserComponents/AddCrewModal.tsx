import React, { useMemo, useState } from 'react';
import { createCrew } from '../../../../api/crewApi';
import { User } from '../../../../types/User';
import { ServiceType } from '../../../../types/Crew';
import {
  Users, UsersRound, Hotel, Wrench, Utensils, Coffee,
  ConciergeBell, Bath, Shield, Cpu, HandCoins, UserRoundPlus
} from 'lucide-react';

type Props = {
  onClose: () => void;
  onSuccess: () => void;
  allUsers: User[];
};

const serviceOptions: { value: ServiceType; label: string; icon: React.ReactNode }[] = [
  { value: 'RECEPTION', label: 'Réception', icon: <Hotel className="w-4 h-4" /> },
  { value: 'HOUSEKEEPING', label: 'Housekeeping', icon: <UsersRound className="w-4 h-4" /> },
  { value: 'MAINTENANCE', label: 'Maintenance', icon: <Wrench className="w-4 h-4" /> },
  { value: 'KITCHEN', label: 'Cuisine', icon: <Utensils className="w-4 h-4" /> },
  { value: 'RESTAURANT', label: 'Restaurant', icon: <Utensils className="w-4 h-4" /> },
  { value: 'BAR', label: 'Bar', icon: <Coffee className="w-4 h-4" /> },
  { value: 'CONCIERGE', label: 'Conciergerie', icon: <ConciergeBell className="w-4 h-4" /> },
  { value: 'SPA', label: 'Spa', icon: <Bath className="w-4 h-4" /> },
  { value: 'SECURITY', label: 'Sécurité', icon: <Shield className="w-4 h-4" /> },
  { value: 'IT', label: 'IT', icon: <Cpu className="w-4 h-4" /> },
  { value: 'FINANCE', label: 'Finance', icon: <HandCoins className="w-4 h-4" /> },
  { value: 'HR', label: 'RH', icon: <Users className="w-4 h-4" /> },
];

const AddCrewModal: React.FC<Props> = ({ onClose, onSuccess, allUsers }) => {
  const [name, setName] = useState('');
  const [service, setService] = useState<ServiceType>('RECEPTION');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const users = useMemo(() => allUsers, [allUsers]);

  const toggle = (id: number) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Le nom du crew est requis.'); return; }
    setLoading(true); setError(null);
    try {
      await createCrew({ name, service, memberIds: selectedIds });
      onSuccess();
      onClose();
    } catch {
      setError('Impossible de créer le crew.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="bg-white/60 backdrop-blur-xl w-full max-w-3xl rounded-3xl shadow-xl p-10 space-y-8 border border-white/20 animate-fade-in"
      >
        {/* Titre */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <UserRoundPlus className="h-6 w-6 text-[#47B881]" />
          <h2 className="text-2xl font-semibold text-gray-800">Ajouter un Crew</h2>
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <input
            placeholder="Nom du crew (ex: Maintenance Nuit)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input sm:col-span-2"
            required
          />
          <select
            value={service}
            onChange={e => setService(e.target.value as ServiceType)}
            className="input"
          >
            {serviceOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Sélection des membres (cartes vertes quand sélectionnées) */}
        <div>
          <div className="text-sm text-gray-600 mb-3">Sélectionner des membres</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {users.map(u => {
              const active = selectedIds.includes(u.id);
              return (
                <button
                  type="button"
                  key={u.id}
                  onClick={() => toggle(u.id)}
                  className={`flex flex-col items-center justify-center w-36 h-36 p-5 rounded-3xl 
                    border border-white/30 bg-white/50 backdrop-blur-xl
                    shadow-[0_8px_24px_rgba(0,0,0,0.08)] ring-1 ring-white/20 
                    transition-transform duration-200 hover:scale-105 hover:shadow-xl
                    ${active ? 'bg-[#54f1a3] shadow-[0_8px_24px_rgba(71,184,129,0.20)]' : ''}`}
                  title={`${u.firstName} ${u.lastName}`}
                >
                  <Users className="h-8 w-8 text-[#47B881] mb-2" />
                  <div className="text-sm font-semibold text-gray-800 text-center">
                    {u.firstName} {u.lastName}
                  </div>
                  <div className="text-[11px] text-gray-500 uppercase mt-1 tracking-widest">
                    {u.role}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-[#47B881] to-[#3da36f] text-white shadow-md hover:shadow-lg transition"
          >
            {loading ? 'Création…' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCrewModal;
