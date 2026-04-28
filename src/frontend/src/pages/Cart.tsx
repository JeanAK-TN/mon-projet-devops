import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function Cart() {
  const { items, updateQty, remove, clear, total } = useCart();
  const { token, user } = useAuth();
  const nav = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const checkout = async () => {
    if (!user || !token) {
      nav('/login');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const order = await api.createOrder(
        items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        token
      );
      clear();
      setSuccess(`Commande #${order.id} créée. Total : ${Number(order.total).toFixed(2)} €`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div>
        <h1>Merci !</h1>
        <p>{success}</p>
        <Link to="/profile">Voir mes commandes →</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <h1>Panier vide</h1>
        <p><Link to="/products">Voir les produits →</Link></p>
      </div>
    );
  }

  return (
    <div>
      <h1>Mon panier</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr><th align="left">Produit</th><th>Qté</th><th>Prix</th><th>Total</th><th></th></tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.productId} style={{ borderTop: '1px solid #eee' }}>
              <td style={{ padding: '0.5rem' }}>{i.name}</td>
              <td align="center">
                <input
                  type="number"
                  min="1"
                  value={i.quantity}
                  onChange={(e) => updateQty(i.productId, parseInt(e.target.value, 10) || 1)}
                  style={{ width: 60 }}
                />
              </td>
              <td align="center">{i.price.toFixed(2)} €</td>
              <td align="center">{(i.price * i.quantity).toFixed(2)} €</td>
              <td align="center">
                <button type="button" onClick={() => remove(i.productId)} style={{ background: '#b00020' }}>
                  Retirer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} align="right" style={{ padding: '1rem', fontWeight: 600 }}>Total :</td>
            <td align="center" style={{ fontWeight: 600 }}>{total.toFixed(2)} €</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
        <button type="button" onClick={checkout} disabled={submitting}>
          {submitting ? 'Validation...' : 'Passer la commande'}
        </button>
        <button type="button" onClick={clear} style={{ background: '#888' }}>Vider le panier</button>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
