import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState<RegisterForm>({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(form.email, form.password, form.name);
      nav('/products');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const update = (k: keyof RegisterForm) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      <h1>Inscription</h1>
      <form onSubmit={submit}>
        <input placeholder="Nom" value={form.name} onChange={update('name')} required />
        <input type="email" placeholder="Email" value={form.email} onChange={update('email')} required />
        <input type="password" placeholder="Mot de passe (min 8 car.)" value={form.password} onChange={update('password')} minLength={8} required />
        <button type="submit">Créer le compte</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
