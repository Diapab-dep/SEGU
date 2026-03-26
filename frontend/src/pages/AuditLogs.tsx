import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, type AuditLog, type AuditFilters } from '../api/client';

const ACTIONS = [
  'LOGIN', 'LOGOUT',
  'ADMISSION_CREATE', 'ADMISSION_ACCEPT', 'ADMISSION_REJECT',
  'CHECKLIST_CREATE', 'CHECKLIST_SUBMIT', 'CHECKLIST_APPROVE', 'CHECKLIST_REJECT',
  'USER_CREATE', 'USER_UPDATE', 'USER_DELETE',
];

const ENTITY_TYPES = ['Merchandise', 'MerchandiseChecklist', 'User'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-CO', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function exportCsv(logs: AuditLog[]) {
  const headers = ['ID', 'Fecha', 'Usuario', 'Acción', 'Entidad', 'ID Entidad', 'IP', 'Detalles'];
  const rows = logs.map((l) => [
    l.id,
    formatDate(l.createdAt),
    l.username ?? l.userId ?? '',
    l.action,
    l.entityType ?? '',
    l.entityId ?? '',
    l.ipAddress ?? '',
    l.details ?? '',
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AuditLogs() {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/" replace />;

  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7) + '-01';

  const [filters, setFilters] = useState<AuditFilters>({ from: monthStart, to: today, limit: 200 });
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    api.getAuditLogs(filters)
      .then(setLogs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); load(); };

  return (
    <div className="page">
      <section className="page-header">
        <h1>Registro de Auditoría</h1>
        <p>Consulte y descargue el historial de acciones del sistema.</p>
      </section>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="form-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
        <label style={{ flex: '1 1 140px' }}>
          Desde
          <input type="date" value={filters.from ?? ''} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
        </label>
        <label style={{ flex: '1 1 140px' }}>
          Hasta
          <input type="date" value={filters.to ?? ''} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        </label>
        <label style={{ flex: '1 1 180px' }}>
          Acción
          <select value={filters.action ?? ''} onChange={(e) => setFilters({ ...filters, action: e.target.value || undefined })}>
            <option value="">Todas</option>
            {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <label style={{ flex: '1 1 160px' }}>
          Entidad
          <select value={filters.entityType ?? ''} onChange={(e) => setFilters({ ...filters, entityType: e.target.value || undefined })}>
            <option value="">Todas</option>
            {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label style={{ flex: '1 1 160px' }}>
          ID Usuario
          <input type="text" placeholder="UUID o vacío" value={filters.userId ?? ''} onChange={(e) => setFilters({ ...filters, userId: e.target.value || undefined })} />
        </label>
        <label style={{ flex: '0 1 80px' }}>
          Límite
          <input type="number" min={1} max={500} value={filters.limit ?? 200} onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) || 200 })} />
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Cargando...' : 'Consultar'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            disabled={logs.length === 0}
            onClick={() => exportCsv(logs)}
            title="Descargar CSV"
          >
            ⬇ CSV
          </button>
        </div>
      </form>

      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
        {loading ? 'Consultando...' : `${logs.length} registro${logs.length !== 1 ? 's' : ''} encontrado${logs.length !== 1 ? 's' : ''}`}
      </p>

      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Acción</th>
              <th>Entidad</th>
              <th>ID Entidad</th>
              <th>IP</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && !loading && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8' }}>Sin resultados</td></tr>
            )}
            {logs.map((l) => (
              <tr key={l.id}>
                <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{formatDate(l.createdAt)}</td>
                <td>{l.username ?? l.userId ?? '—'}</td>
                <td><span className={`status-badge ${l.action.includes('REJECT') ? 'status-rejected' : l.action.includes('ACCEPT') || l.action.includes('SUBMIT') ? 'status-accepted' : 'status-pending'}`}>{l.action}</span></td>
                <td>{l.entityType ?? '—'}</td>
                <td style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{l.entityId ?? '—'}</td>
                <td>{l.ipAddress ?? '—'}</td>
                <td style={{ fontSize: '0.75rem', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.details ?? ''}>
                  {l.details ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
