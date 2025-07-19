// src/pages/login/LoginPage.tsx
import { useState } from 'react';
import { login } from '../../api/authApi';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  role: string;
  userId: number;
  hotelId: number;
  iat: number;
  exp: number;
}


const LoginPage = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const { token } = await login(credentials);        // type OK
    localStorage.setItem('token', token);

    const decoded = jwtDecode<DecodedToken>(token);    // type OK
    const role = decoded.role;



    switch (role) {
      case 'MANAGER':
        navigate('/manager');
        break;
      case 'EMPLOYE':
        navigate('/employe');
        break;
      case 'CLIENT':
        navigate('/client');
        break;
      default:
        navigate('/dashboard');
    }

  } catch (error) {
    // error est unknown : on peut lever la bonne exception ou tester axios.isAxiosError(error)
    console.error(error);
    alert('Échec de la connexion');
  }
};



  return (
    <form onSubmit={handleSubmit}>
      <h2>Connexion</h2>
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="password" type="password" placeholder="Mot de passe" onChange={handleChange} />
      <button type="submit">Se connecter</button>
    </form>
  );
};

export default LoginPage;
