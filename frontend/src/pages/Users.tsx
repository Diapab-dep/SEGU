import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, type User, type CreateUserData, type PointOfSale } from '../api/client';

export function Users() {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/" replace />;

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<{ code: string; name: string }[]>([]);
  const [posList, setPosList] = useState<PointOfSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [form, setForm] = useState<CreateUserData & { password?: string }>({
    username: '', password: '', email: '', role: 'advisor', isDeprisacheckEnabled: false, pointOfSaleId: '',
  });

  const load = () => {
    setLoading(true);
    api.getUsers()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api.getRoles().then(setRoles).catch(console.error);
    api.getPointsOfSale().then(setPosList).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.updateUser(editing.id, {
          email: form.email, role: form.role,
          isDeprisacheckEnabled: form.isDeprisacheckEnabled,
          pointOfSaleId: form.pointOfSaleId || undefined,
        });
      } else {
        if (!form.password?.trim()) { setError('La contraseña es requerida para nuevos usuarios'); return; }
        await api.createUser({ ...form, password: form.password } as CreateUserData & { password: string });
      }
      setShowForm(false);
      setEditing(null);
      setForm({ username: '', password: '', email: '', role: 'advisor', isDeprisacheckEnabled: false, pointOfSaleId: '' });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  };

  const handleEdit = (u: User) => {
    setEditing(u);
    setForm({ username: u.username, email: u.email || '', role: u.role, isDeprisacheckEnabled: u.isDeprisacheckEnabled, pointOfSaleId: u.pointOfSaleId || '' });
    setShowForm(true);
  };

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`¿Eliminar usuario ${username}?`)) return;
    try { await api.deleteUser(id); load(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
  };

  const handleToggleStatus = async (u: User) => {
    if (!confirm(`¿${u.isActive ? 'Desactivar' : 'Activar'} usuario "${u.username}"?`)) return;
    try { await api.updateUserStatus(u.id, !u.isActive); load(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPasswordModal) return;
    setError('');
    try {
      await api.changeUserPassword(showPasswordModal.id, newPassword);
      setShowPasswordModal(null);
      setNewPassword('');
    } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
  };

  const roleName = (code: string) => roles.find((x) => x.code === code)?.name ?? code;
  const posName = (id?: string) => posList.find((p) => p.id === id)?.name ?? '—';

  return (
    <div className="page">
      <section className="page-header">
        <h1>Módulo de Usuarios</h1>
        <p>Gestione usuarios, roles, POS y habilitación DeprisaCheck.</p>
      </section>

      {error && <p className="error">{error}</p>}

      <button className="btn-primary" onClick={() => {
        setShowForm(true); setEditing(null);
        setForm({ username: '', password: '', email: '', role: 'advisor', isDeprisacheckEnabled: false, pointOfSaleId: '' });
      }}>Nuevo usuario</button>

      {showForm && (
        <div className="form-card">
          <h3>{editing ? 'Editar usuario' : 'Crear usuario'}</h3>
          <form onSubmit={handleSubmit}>
            <label>Usuario<input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} disabled={!!editing} required /></label>
            {!editing && (
              <label>Contraseña<input type="password" value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
            )}
            <label>Email<input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label>Rol
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {roles.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
              </select>
            </label>
            <label>Punto de venta
              <select value={form.pointOfSaleId || ''} onChange={(e) => setForm({ ...form, pointOfSaleId: e.target.value })}>
                <option value="">Sin asignar</option>
                {posList.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.type === 'ato' ? 'ATO' : 'Ciudad'})</option>)}
              </select>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={form.isDeprisacheckEnabled || false} onChange={(e) => setForm({ ...form, isDeprisacheckEnabled: e.target.checked })} />
              Habilitado para DeprisaCheck
            </label>
            <div className="button-group">
              <button type="submit">{editing ? 'Guardar' : 'Crear'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal cambio de contraseña */}
      {showPasswordModal && (
        <div className="form-card">
          <h3>Cambiar contraseña — {showPasswordModal.username}</h3>
          <form onSubmit={handleChangePassword}>
            <label>Nueva contraseña (mínimo 6 caracteres)
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required />
            </label>
            <div className="button-group">
              <button type="submit">Cambiar</button>
              <button type="button" className="btn-secondary" onClick={() => { setShowPasswordModal(null); setNewPassword(''); }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        {loading ? <p>Cargando...</p> : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuario</th><th>Email</th><th>Rol</th><th>POS</th><th>DeprisaCheck</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ opacity: u.isActive ? 1 : 0.55 }}>
                  <td>{u.username}</td>
                  <td>{u.email || '—'}</td>
                  <td>{roleName(u.role)}</td>
                  <td>{posName(u.pointOfSaleId)}</td>
                  <td>{u.isDeprisacheckEnabled ? 'Sí' : 'No'}</td>
                  <td><span className={`status-badge ${u.isActive ? 'status-accepted' : 'status-rejected'}`}>{u.isActive ? 'Activo' : 'Inactivo'}</span></td>
                  <td>
                    <button className="btn-sm" onClick={() => handleEdit(u)}>Editar</button>
                    <button className="btn-sm" onClick={() => handleToggleStatus(u)}>{u.isActive ? 'Desactivar' : 'Activar'}</button>
                    <button className="btn-sm" onClick={() => { setShowPasswordModal(u); setNewPassword(''); }}>Contraseña</button>
                    <button className="btn-sm btn-danger" onClick={() => handleDelete(u.id, u.username)}>Eliminar</button>
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
