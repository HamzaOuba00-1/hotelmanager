// src/pages/MePage.tsx
import { useEffect, useState } from 'react';
import { getMe } from '../api/userApi';

const MePage = () => {
  const [userInfo, setUserInfo] = useState('');

  useEffect(() => {
    getMe()
      .then(setUserInfo)
      .catch(() => setUserInfo('Erreur'));
  }, []);

  return <div>{userInfo}</div>;
};

export default MePage;
