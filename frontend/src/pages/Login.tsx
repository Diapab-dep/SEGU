import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
      <div className="login-card">
        <h1>DeprisaCheck</h1>
        <p>Proceso de Admisión de Mercancía</p>
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
    </div>
  );
}
