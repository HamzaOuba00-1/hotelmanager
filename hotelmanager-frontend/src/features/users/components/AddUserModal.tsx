import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserRoundPlus, Clipboard } from 'lucide-react';

interface AddUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'EMPLOYE',
    password: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hotelName = localStorage.getItem('hotelName') || 'HOTELFAKE';
  const hotelId = localStorage.getItem('hotelId') || '123';

  const substituteLetters = (input: string) => {
    const map: Record<string, string> = {
      a: 'z', b: 'p', c: 'm', d: 'j', e: 'e', f: 'o', g: 'u', h: 'pm',
      i: 'm', j: 'n', k: 'l', l: 'k', m: 'f', n: 'v', o: '0', p: 'z',
      q: 'h', r: 'e', s: 'p', t: 'o', u: 'g', v: 'sq', w: 'xx',
      x: 's', y: 'd', z: 'a'
    };
    return input.split('').map(c => map[c.toLowerCase()] || c).join('');
  };

  const normalizeHotelName = (name: string) =>
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

  useEffect(() => {
    const { firstName, lastName } = form;

    if (firstName && lastName) {
      const substitutedFirst = substituteLetters(firstName.substring(0, 1).toLowerCase());
      const substitutedLast = substituteLetters(lastName.substring(0, 1).toLowerCase());

      const hotelPrefixRaw = hotelName.substring(0, 2).toLowerCase();
      const substitutedHotelPrefix = substituteLetters(hotelPrefixRaw);

      const idNumeric = parseInt(hotelId);
      const idCalculated = idNumeric * 23;

      const password =
        substitutedFirst +
        '@!' +
        substitutedLast +
        hotelPrefixRaw +
        idCalculated +
        '!';

      const normalizedHotel = normalizeHotelName(hotelName);
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${normalizedHotel}.hotel`;

      setForm((prev) => ({ ...prev, email, password }));
    } else {
      setForm((prev) => ({ ...prev, email: '', password: '' }));
    }
  }, [form.firstName, form.lastName, hotelName, hotelId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      console.log("Token envoyé:", token);

      if (!token) {
        setError("Aucun token trouvé. Veuillez vous reconnecter.");
        return;
      }

      await axios.post(
        'http://localhost:8080/users',
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      
      onSuccess();
      onClose();
    } catch (err) {
      setError("Impossible d'ajouter l'utilisateur.");
    } finally {
      setLoading(false);
    }
  };


  const copyToClipboard = () => {
    navigator.clipboard.writeText(form.password);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/60 backdrop-blur-xl w-full max-w-2xl rounded-3xl shadow-xl p-10 space-y-8 border border-white/20 animate-fade-in"
      >
        {/* Titre */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <UserRoundPlus className="h-6 w-6 text-[#47B881]" />
          <h2 className="text-2xl font-semibold text-gray-800">Ajouter un Membre</h2>
        </div>

        {error && <p className="text-red-500 text-sm text-center -mt-4">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <input
            name="firstName"
            placeholder="Prénom"
            value={form.firstName}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="lastName"
            placeholder="Nom"
            value={form.lastName}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email généré automatiquement"
            value={form.email}
            readOnly
            className="input sm:col-span-2 bg-gray-100 cursor-not-allowed"
            required
          />

          {/* Mot de passe généré */}
          <div className="relative">
            <input
              name="password"
              type="text"
              placeholder="Mot de passe généré"
              value={form.password}
              readOnly
              className="input pr-10 bg-gray-100 cursor-not-allowed"
            />
            <button
              type="button"
              onClick={copyToClipboard}
              className="absolute right-2 top-2 text-gray-400 hover:text-[#47B881]"
              title="Copier"
            >
              <Clipboard size={18} />
            </button>
          </div>

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="input"
          >
            <option value="EMPLOYE">Employé</option>
            <option value="MANAGER">Manager</option>
          </select>
        </div>

        <div className="flex justify-end gap-4 pt-6">
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
            {loading ? 'Ajout...' : 'Ajouter'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUserModal;
