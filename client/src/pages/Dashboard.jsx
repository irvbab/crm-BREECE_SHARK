import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api('/auth/me').then(setUser);
  }, []);

  async function logout() {
    await api('/auth/logout', { method: 'POST' });
    navigate('/login');
  }

  return (
    <div>
      <h1>Bonjour {user?.name} </h1>
      <p>{user?.email}</p>
      <button onClick={logout}>Se déconnecter</button>
    </div>
  );
}