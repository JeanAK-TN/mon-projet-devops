import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import type { Order } from '../types';

export default function Profile() {
  const { user, token, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!token) return;
    setFetching(true);
    api.listOrders(token)
      .then(setOrders)
      .catch((e) => setError((e as Error).message))
      .finally(() => setFetching(false));
  }, [token]);

  if (loading) return <p>Chargement...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div>
      <h1>Mon profil</h1>
      <div style={{ background: '#fff', padding: '1rem', borderRadius: 8, marginBottom: '1.5rem' }}>
        <p><strong>Nom :</strong> {user.name}</p>
        <p><strong>Email :</strong> {user.email}</p>
        <p><strong>Rôle :</strong> {user.role}</p>
      </div>

      <h2>Mes commandes</h2>
      {error && <p className="error">{error}</p>}
      {fetching ? (
        <p>Chargement...</p>
      ) : orders.length === 0 ? (
        <p>Aucune commande pour le moment.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
          <thead>
            <tr>
              <th align="left" style={{ padding: '0.5rem' }}>#</th>
              <th align="left">Date</th>
              <th align="left">Articles</th>
              <th align="left">Statut</th>
              <th align="right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>{o.id}</td>
                <td>{new Date(o.createdAt).toLocaleString()}</td>
                <td>{o.items?.reduce((s, i) => s + i.quantity, 0) ?? 0}</td>
                <td>{o.status}</td>
                <td align="right">{Number(o.total).toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
