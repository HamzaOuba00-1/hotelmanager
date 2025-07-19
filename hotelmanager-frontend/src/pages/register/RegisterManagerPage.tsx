import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerManager } from '../../api/authApi';

const RegisterManagerPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    hotelCode: '',
    hotelName: ''
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await registerManager(formData);
      localStorage.setItem('token', res.token);
      alert('Inscription réussie !');
      navigate('/dashboard/manager');
    } catch (err) {
      alert("Erreur d'inscription");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Inscription Manager</h2>
      <input name="firstName" placeholder="Prénom" onChange={handleChange} required />
      <input name="lastName" placeholder="Nom" onChange={handleChange} required />
      <input name="email" placeholder="Email" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Mot de passe" onChange={handleChange} required />
      <input name="hotelCode" placeholder="Code Hôtel" onChange={handleChange} required />
      <input name="hotelName" placeholder="Nom Hôtel (si nouveau)" onChange={handleChange} />
      <button type="submit">S’inscrire</button>
    </form>
  );
};

export default RegisterManagerPage;
