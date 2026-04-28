import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <h1>Bienvenue sur la boutique DevOps</h1>
      <p>Application e-commerce démo — projet final Bachelor 3 DevOps.</p>
      <p>
        <Link to="/products">Voir les produits →</Link>
      </p>
    </div>
  );
}
