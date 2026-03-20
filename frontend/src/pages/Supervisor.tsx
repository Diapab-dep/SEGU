import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, type AdmissionSummary, type Metrics, type PointOfSale, type MerchandiseType } from '../api/client';

type RangeOption = 'today' | 'week' | 'custom';

function getDateRange(range: RangeOption, customFrom: string, customTo: string) {
  const today = new Date().toISOString().slice(0, 10);
  if (range === 'today') return { from: today, to: today };
  if (range === 'week') {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return { from: d.toISOString().slice(0, 10), to: today };
  }
  return { from: customFrom, to: customTo };
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  requires_deprisacheck: 'DeprisaCheck',
  accepted: 'Aceptado',
  rejected: 'Rechazado',
};

const STATUS_CLASS: Record<string, string> = {
  pending: 'status-pending',
  requires_deprisacheck: 'status-deprisacheck',
  accepted: 'status-accepted',
  rejected: 'status-rejected',
};

export function Supervisor() {
  const { user } = useAuth();
  if (user?.role === 'asesor') return <Navigate to="/" replace />;

  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [admissions, setAdmissions] = useState<AdmissionSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [posList, setPosList] = useState<PointOfSale[]>([]);
  const [typeList, setTypeList] = useState<MerchandiseType[]>([]);

  const [posId, setPosId] = useState('');
  const [typeId, setTypeId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [range, setRange] = useState<RangeOption>('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const limit = 20;

  useEffect(() => {
    api.getPointsOfSale().then(setPosList).catch(console.error);
    api.getMerchandiseTypes().then(setTypeList).catch(console.error);
  }, []);

  const loadData = useCallback(async (currentPage: number) => {
    setLoading(true);
    setError('');
    try {
      const { from, to } = getDateRange(range, customFrom, customTo);
      const filters = { posId: posId || undefined, merchandiseTypeId: typeId || undefined, status: statusFilter || undefined, from, to };
      const [m, a] = await Promise.all([
        api.getMetrics(filters),
        api.getAdmissions({ ...filters, page: currentPage, limit }),
      ]);
      setMetrics(m);
      setAdmissions(a.data);
      setTotal(a.total);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [posId, typeId, statusFilter, range, customFrom, customTo]);

  useEffect(() => { loadData(1); setPage(1); }, [loadData]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="page">
      <section className="page-header">
        <h1>Panel de Supervisión</h1>
        <p>Bienvenido, <strong>{user?.username}</strong>. Métricas y admisiones en tiempo real.</p>
      </section>

      {error && <p className="error">{error}</p>}

      {/* Métricas */}
      {metrics && (
        <div className="metrics-grid">
          <div className="metric-card"><span className="metric-value">{metrics.total}</span><span className="metric-label">Total</span></div>
          <div className="metric-card metric-pending"><span className="metric-value">{metrics.pending}</span><span className="metric-label">Pendientes</span></div>
          <div className="metric-card metric-deprisacheck"><span className="metric-value">{metrics.requiresDeprisacheck}</span><span className="metric-label">DeprisaCheck</span></div>
          <div className="metric-card metric-accepted"><span className="metric-value">{metrics.accepted}</span><span className="metric-label">Aceptadas</span></div>
          <div className="metric-card metric-rejected"><span className="metric-value">{metrics.rejected}</span><span className="metric-label">Rechazadas</span></div>
        </div>
      )}

      {/* Filtros */}
      <div className="filters-bar">
        <select value={range} onChange={(e) => setRange(e.target.value as RangeOption)}>
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="custom">Rango personalizado</option>
        </select>
        {range === 'custom' && (
          <>
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
          </>
        )}
        <select value={posId} onChange={(e) => setPosId(e.target.value)}>
          <option value="">Todos los POS</option>
          {posList.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={typeId} onChange={(e) => setTypeId(e.target.value)}>
          <option value="">Todos los tipos</option>
          {typeList.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="requires_deprisacheck">DeprisaCheck</option>
          <option value="accepted">Aceptado</option>
          <option value="rejected">Rechazado</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="table-container">
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Fecha / Hora</th>
                  <th>Cliente</th>
                  <th>Tipo de mercancía</th>
                  <th>Punto de venta</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {admissions.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center' }}>No hay admisiones para los filtros seleccionados</td></tr>
                ) : admissions.map((a) => (
                  <tr key={a.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admissions/${a.id}`)}>
                    <td>{new Date(a.createdAt).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td>{a.client.name}</td>
                    <td>{a.merchandiseType.name}</td>
                    <td>{a.pointOfSale.name}</td>
                    <td><span className={`status-badge ${STATUS_CLASS[a.status] ?? ''}`}>{STATUS_LABEL[a.status] ?? a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page <= 1} onClick={() => { setPage(page - 1); loadData(page - 1); }}>‹ Anterior</button>
                <span>Página {page} de {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => { setPage(page + 1); loadData(page + 1); }}>Siguiente ›</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
