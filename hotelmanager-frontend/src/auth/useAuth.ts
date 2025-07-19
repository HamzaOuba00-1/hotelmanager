interface TokenPayload {
  role: 'MANAGER' | 'EMPLOYE' | 'CLIENT';
  sub: string;
  exp: number;
  [key: string]: any; // pour champs supplémentaires éventuels
}

export const useAuth = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1]; // prend la partie payload
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );

    const payload: TokenPayload = JSON.parse(jsonPayload);
    return payload;
  } catch (err) {
    console.error('Invalid token:', err);
    return null;
  }
};

