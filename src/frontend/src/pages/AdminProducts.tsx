import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import type { Product } from '../types';

interface FormState {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  imageUrl: string;
}

const empty: FormState = { name: '', description: '', price: '', stock: '', category: '', imageUrl: '' };

export default function AdminProducts() {
  const { user, token, loading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<FormState>(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = () =>
    api.listProducts({ limit: 100 })
      .then((r) => setProducts(r.products))
      .catch((e) => setError((e as Error).message));

  useEffect(() => { reload(); }, []);

  if (loading) return <p>Chargement...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;

  const update = (k: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token) return;
    const payload: Partial<Product> = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10) || 0,
      category: form.category,
      imageUrl: form.imageUrl || undefined,
    };
    try {
      if (editingId) {
        await api.updateProduct(editingId, payload, token);
      } else {
        await api.createProduct(payload, token);
      }
      setForm(empty);
      setEditingId(null);
      await reload();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name || '',
      description: p.description || '',
      price: String(p.price ?? ''),
      stock: String(p.stock ?? ''),
      category: p.category || '',
      imageUrl: p.imageUrl || '',
    });
  };

  const remove = async (id: number) => {
    if (!confirm('Supprimer ce produit ?')) return;
    if (!token) return;
    try {
      await api.deleteProduct(id, token);
      await reload();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <h1>Admin — Produits</h1>

      <h2>{editingId ? `Édition #${editingId}` : 'Nouveau produit'}</h2>
      <form onSubmit={submit} style={{ maxWidth: 480 }}>
        <input placeholder="Nom" value={form.name} onChange={update('name')} required />
        <input placeholder="Description" value={form.description} onChange={update('description')} />
        <input type="number" step="0.01" placeholder="Prix" value={form.price} onChange={update('price')} required />
        <input type="number" placeholder="Stock" value={form.stock} onChange={update('stock')} />
        <input placeholder="Catégorie" value={form.category} onChange={update('category')} required />
        <input placeholder="URL image" value={form.imageUrl} onChange={update('imageUrl')} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit">{editingId ? 'Mettre à jour' : 'Créer'}</button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(empty); }} style={{ background: '#888' }}>
              Annuler
            </button>
          )}
        </div>
        {error && <p className="error">{error}</p>}
      </form>

      <h2 style={{ marginTop: '2rem' }}>Liste ({products.length})</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr>
            <th align="left" style={{ padding: '0.5rem' }}>#</th>
            <th align="left">Nom</th>
            <th align="left">Catégorie</th>
            <th align="right">Prix</th>
            <th align="right">Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} style={{ borderTop: '1px solid #eee' }}>
              <td style={{ padding: '0.5rem' }}>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td align="right">{Number(p.price).toFixed(2)} €</td>
              <td align="right">{p.stock}</td>
              <td align="right">
                <button type="button" onClick={() => startEdit(p)}>Éditer</button>{' '}
                <button type="button" onClick={() => remove(p.id)} style={{ background: '#b00020' }}>Suppr.</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
