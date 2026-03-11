import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, type User, type CreateUserData } from '../api/client';

export function Users() {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<{ code: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<CreateUserData>({
    username: '',
    password: '',
    email: '',
    role: 'advisor',
    isDeprisacheckEnabled: false,
  });

  const load = () => {
    setLoading(true);
    api
      .getUsers()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api.getRoles().then(setRoles).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.updateUser(editing.id, {
          email: form.email,
          role: form.role,
          isDeprisacheckEnabled: form.isDeprisacheckEnabled,
        });
      } else {
        if (!form.password?.trim()) {
          setError('La contraseña es requerida para nuevos usuarios');
          return;
        }
        await api.createUser({
          ...form,
          password: form.password,
        } as CreateUserData & { password: string });
      }
      setShowForm(false);
      setEditing(null);
      setForm({ username: '', password: '', email: '', role: 'advisor', isDeprisacheckEnabled: false });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  };

  const handleEdit = (u: User) => {
    setEditing(u);
    setForm({
      username: u.username,
      email: u.email || '',
      role: u.role,
      isDeprisacheckEnabled: u.isDeprisacheckEnabled,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`¿Eliminar usuario ${username}?`)) return;
    try {
      await api.deleteUser(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  };

  const roleName = (code: string) => {
    const r = roles.find((x) => x.code === code);
    return r?.name ?? code;
  };

  return (
    <div className="page">
      <h1>Módulo de Usuarios</h1>
      <p>Gestione usuarios y asigne los roles correspondientes.</p>

      {error && <p className="error">{error}</p>}

      <button
        className="btn-primary"
        onClick={() => {
          setShowForm(true);
          setEditing(null);
          setForm({ username: '', password: '', email: '', role: 'advisor', isDeprisacheckEnabled: false });
        }}
      >
        Nuevo usuario
      </button>

      {showForm && (
        <div className="form-card">
          <h3>{editing ? 'Editar usuario' : 'Crear usuario'}</h3>
          <form onSubmit={handleSubmit}>
            <label>
              Usuario
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                disabled={!!editing}
                required
              />
            </label>
            {!editing && (
              <label>
                Contraseña
                <input
                  type="password"
                  value={form.password || ''}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </label>
            )}
            <label>
              Email
              <input
                type="email"
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label>
              Rol
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {roles.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.isDeprisacheckEnabled || false}
                onChange={(e) => setForm({ ...form, isDeprisacheckEnabled: e.target.checked })}
              />
              Habilitado para DeprisaCheck
            </label>
            <div className="button-group">
              <button type="submit">{editing ? 'Guardar' : 'Crear'}</button>
              <button type="button" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>DeprisaCheck</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.email || '-'}</td>
                  <td>{roleName(u.role)}</td>
                  <td>{u.isDeprisacheckEnabled ? 'Sí' : 'No'}</td>
                  <td>
                    <button className="btn-sm" onClick={() => handleEdit(u)}>
                      Editar
                    </button>
                    <button className="btn-sm btn-danger" onClick={() => handleDelete(u.id, u.username)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
