import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Product } from '../types';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.listProducts({ search, limit: 24 })
      .then((res) => setProducts(res.products))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div>
      <h1>Produits</h1>
      <input
        placeholder="Rechercher..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ maxWidth: 320 }}
      />
      {error && <p className="error">{error}</p>}
      {loading ? <p>Chargement...</p> : (
        <div className="products-grid">
          {products.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="product-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              {p.imageUrl && <img src={p.imageUrl} alt={p.name} />}
              <h3>{p.name}</h3>
              <div className="price">{Number(p.price).toFixed(2)} €</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
