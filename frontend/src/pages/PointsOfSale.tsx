import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, type PointOfSale } from '../api/client';

export function PointsOfSale() {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/" replace />;

  const [list, setList] = useState<PointOfSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PointOfSale | null>(null);
  const [form, setForm] = useState({ name: '', type: 'city', baseRestrictions: '' });

  const load = () => {
    setLoading(true);
    api.getAllPointsOfSale()
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.updatePointOfSale(editing.id, { name: form.name, type: form.type, baseRestrictions: form.baseRestrictions || undefined });
      } else {
        await api.createPointOfSale({ name: form.name, type: form.type, baseRestrictions: form.baseRestrictions || undefined });
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', type: 'city', baseRestrictions: '' });
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleEdit = (pos: PointOfSale) => {
    setEditing(pos);
    setForm({ name: pos.name, type: pos.type, baseRestrictions: pos.baseRestrictions ?? '' });
    setShowForm(true);
  };

  const handleToggle = async (pos: PointOfSale) => {
    if (!confirm(`¿${pos.isActive ? 'Desactivar' : 'Activar'} "${pos.name}"?`)) return;
    try {
      await api.togglePointOfSale(pos.id);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="page">
      <section className="page-header">
        <h1>Puntos de Venta</h1>
        <p>Gestione los puntos de venta de la plataforma.</p>
      </section>

      {error && <p className="error">{error}</p>}

      <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', type: 'city', baseRestrictions: '' }); }}>
        Nuevo punto de venta
      </button>

      {showForm && (
        <div className="form-card">
          <h3>{editing ? 'Editar punto de venta' : 'Nuevo punto de venta'}</h3>
          <form onSubmit={handleSubmit}>
            <label>Nombre<input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label>Tipo
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="city">Ciudad</option>
                <option value="ato">Aeropuerto (ATO)</option>
              </select>
            </label>
            <label>Restricciones base (opcional)<input type="text" value={form.baseRestrictions} onChange={(e) => setForm({ ...form, baseRestrictions: e.target.value })} /></label>
            <div className="button-group">
              <button type="submit">{editing ? 'Guardar' : 'Crear'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        {loading ? <p>Cargando...</p> : (
          <table className="users-table">
            <thead>
              <tr><th>Nombre</th><th>Tipo</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {list.map((pos) => (
                <tr key={pos.id}>
                  <td>{pos.name}</td>
                  <td>{pos.type === 'ato' ? 'Aeropuerto (ATO)' : 'Ciudad'}</td>
                  <td><span className={pos.isActive ? 'status-badge status-accepted' : 'status-badge status-rejected'}>{pos.isActive ? 'Activo' : 'Inactivo'}</span></td>
                  <td>
                    <button className="btn-sm" onClick={() => handleEdit(pos)}>Editar</button>
                    <button className="btn-sm" onClick={() => handleToggle(pos)}>{pos.isActive ? 'Desactivar' : 'Activar'}</button>
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
