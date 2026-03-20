import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Footer } from '../components/Footer';

export function Login() {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'asesor' | 'supervisor' | 'admin'>('asesor');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    login(username.trim(), role);
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-hero">
        <h1>DeprisaCheck</h1>
        <p>Plataforma de admisión de mercancía</p>
      </div>
      <div className="login-card">
        <img src="/deprisa-logo-login.png" alt="Deprisa" className="login-logo" />
        <p>Ingrese a la plataforma para gestionar el proceso de admisión.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
          <select value={role} onChange={(e) => setRole(e.target.value as 'asesor' | 'supervisor' | 'admin')}>
            <option value="asesor">Asesor</option>
            <option value="supervisor">Supervisor</option>
            <option value="admin">Administrador</option>
          </select>
          <button type="submit">Entrar</button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
