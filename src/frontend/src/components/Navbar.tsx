import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();

  return (
    <nav>
      <div>
        <Link to="/">Shop</Link>
        <Link to="/products">Produits</Link>
        {user?.role === 'admin' && <Link to="/admin/products">Admin</Link>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/cart">Panier ({count})</Link>
        {user ? (
          <>
            <Link to="/profile">{user.name}</Link>
            <button onClick={() => { logout(); nav('/'); }}>Déconnexion</button>
          </>
        ) : (
          <>
            <Link to="/login">Connexion</Link>
            <Link to="/register">Inscription</Link>
          </>
        )}
      </div>
    </nav>
  );
}
