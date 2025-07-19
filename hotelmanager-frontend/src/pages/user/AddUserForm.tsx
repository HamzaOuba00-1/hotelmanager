import React, { useState } from 'react';
import { User, Role } from '../../types/User';
import { getEmptyUser } from '../../utils/formatData';
import { createUser } from '../../api/userApi';

interface Props {
  onUserCreated: (user: User) => void;
}

const AddUserForm: React.FC<Props> = ({ onUserCreated }) => {
  const [formData, setFormData] = useState<User>(getEmptyUser());
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'role' ? (value as Role) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    try {
      const createdUser = await createUser(formData);   // ⬅️ appel backend
      onUserCreated(createdUser);
      setFeedback('Utilisateur créé avec succès ✅');
      setFormData(getEmptyUser());
    } catch (err: any) {
      console.error('Erreur création user', err);
      const msg =
        err.response?.data?.message ??
        err.response?.data ??
        'Erreur inattendue 😕';
      setFeedback(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" />
      <input name="lastName"  value={formData.lastName}  onChange={handleChange} placeholder="Last Name" />
      <input name="email"     value={formData.email}     onChange={handleChange} placeholder="Email" />
      <input name="password"  type="password" value={formData.password} onChange={handleChange} placeholder="Password" />

      <select name="role" value={formData.role} onChange={handleChange}>
        <option value="EMPLOYE">EMPLOYE</option>
        <option value="MANAGER">MANAGER</option>
        <option value="CLIENT">CLIENT</option>
      </select>

      <button type="submit">Créer</button>

      {feedback && <p className="mt-2 text-sm text-blue-600">{feedback}</p>}
    </form>
  );
};

export default AddUserForm;
