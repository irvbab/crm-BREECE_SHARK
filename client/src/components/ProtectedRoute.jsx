import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../api.js';

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    api('/auth/me')
      .then(() => setStatus('ok'))
      .catch(() => setStatus('no'));
  }, []);

  if (status === 'loading') return <p>Chargement…</p>;
  if (status === 'no') return <Navigate to="/login" />;
  return children;
}