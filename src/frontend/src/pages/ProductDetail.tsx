import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const nav = useNavigate();

  useEffect(() => {
    if (!id) return;
    api.getProduct(id).then(setProduct).catch((e) => setError((e as Error).message));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!product) return <p>Chargement...</p>;

  const addToCart = () => {
    add(product, qty);
    nav('/cart');
  };

  return (
    <div>
      <h1>{product.name}</h1>
      {product.imageUrl && <img src={product.imageUrl} alt={product.name} style={{ maxWidth: 480, borderRadius: 8 }} />}
      <p>{product.description}</p>
      <p><strong>{Number(product.price).toFixed(2)} €</strong></p>
      <p>Stock : {product.stock}</p>
      <p>Catégorie : {product.category}</p>
      {product.stock > 0 ? (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '1rem' }}>
          <input
            type="number"
            min="1"
            max={product.stock}
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
            style={{ width: 80 }}
          />
          <button type="button" onClick={addToCart}>Ajouter au panier</button>
        </div>
      ) : (
        <p className="error">Rupture de stock</p>
      )}
    </div>
  );
}
