import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, type Client, type ClientRestriction, type MerchandiseType } from '../api/client';

export function ClientRestrictions() {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/" replace />;

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [restrictions, setRestrictions] = useState<ClientRestriction[]>([]);
  const [mercTypes, setMercTypes] = useState<MerchandiseType[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ merchandiseTypeId: '', restrictionType: 'prohibited' });

  useEffect(() => {
    api.getClients().then(setClients).catch((e) => setError(e.message));
    api.getMerchandiseTypes().then(setMercTypes).catch(console.error);
  }, []);

  const loadRestrictions = (client: Client) => {
    setSelectedClient(client);
    setRestrictions([]);
    api.getClientRestrictions(client.id).then(setRestrictions).catch((e) => setError(e.message));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    setError('');
    try {
      await api.createClientRestriction({ clientId: selectedClient.id, ...form });
      setShowForm(false);
      setForm({ merchandiseTypeId: '', restrictionType: 'prohibited' });
      loadRestrictions(selectedClient);
    } catch (e) { setError((e as Error).message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta restricción?') || !selectedClient) return;
    try { await api.deleteClientRestriction(id); loadRestrictions(selectedClient); }
    catch (e) { setError((e as Error).message); }
  };

  const filtered = clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page">
      <section className="page-header">
        <h1>Restricciones de Clientes</h1>
        <p>Gestione qué tipos de mercancía están restringidos por cliente.</p>
      </section>

      {error && <p className="error">{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginTop: '1rem' }}>
        {/* Lista de clientes */}
        <div>
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', marginBottom: '.75rem' }}
          />
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {filtered.map((c) => (
              <div key={c.id}
                className="form-card"
                style={{ cursor: 'pointer', marginBottom: '.5rem', border: selectedClient?.id === c.id ? '2px solid var(--primary)' : undefined }}
                onClick={() => loadRestrictions(c)}>
                <strong>{c.name}</strong>
                {c.email && <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', margin: 0 }}>{c.email}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Restricciones del cliente seleccionado */}
        <div>
          {!selectedClient ? (
            <div className="info-box"><p>Seleccione un cliente para ver sus restricciones.</p></div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>{selectedClient.name}</h3>
                <button className="btn-primary" onClick={() => setShowForm(true)}>Agregar restricción</button>
              </div>

              {showForm && (
                <div className="form-card">
                  <form onSubmit={handleAdd}>
                    <label>Tipo de mercancía
                      <select value={form.merchandiseTypeId} onChange={(e) => setForm({ ...form, merchandiseTypeId: e.target.value })} required>
                        <option value="">Seleccionar...</option>
                        {mercTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </label>
                    <label>Tipo de restricción
                      <select value={form.restrictionType} onChange={(e) => setForm({ ...form, restrictionType: e.target.value })}>
                        <option value="prohibited">Prohibido</option>
                        <option value="requires_approval">Requiere aprobación</option>
                      </select>
                    </label>
                    <div className="button-group">
                      <button type="submit">Agregar</button>
                      <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                    </div>
                  </form>
                </div>
              )}

              {restrictions.length === 0 ? (
                <div className="info-box"><p>Este cliente no tiene restricciones activas.</p></div>
              ) : (
                <table className="users-table">
                  <thead>
                    <tr><th>Tipo de mercancía</th><th>Restricción</th><th>Acciones</th></tr>
                  </thead>
                  <tbody>
                    {restrictions.map((r) => {
                      const typeName = mercTypes.find((t) => t.id === r.merchandiseTypeId)?.name ?? r.merchandiseTypeId;
                      return (
                        <tr key={r.id}>
                          <td>{typeName}</td>
                          <td>{r.restrictionType === 'prohibited' ? 'Prohibido' : 'Requiere aprobación'}</td>
                          <td>
                            <button className="btn-sm btn-danger" onClick={() => handleDelete(r.id)}>Eliminar</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
