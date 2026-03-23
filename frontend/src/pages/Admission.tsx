import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type MerchandiseType, type PointOfSale } from '../api/client';

export function Admission() {
  const [types, setTypes] = useState<MerchandiseType[]>([]);
  const [posList, setPosList] = useState<PointOfSale[]>([]);
  const [clientId, setClientId] = useState('client-1');
  const [merchandiseTypeId, setMerchandiseTypeId] = useState('');
  const [pointOfSaleId, setPointOfSaleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ merchandiseId: string; merchandiseTypeId?: string; status: string; requiresDeprisacheck?: boolean } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getMerchandiseTypes(), api.getPointsOfSale()])
      .then(([types, posList]) => {
        setTypes(types);
        setPosList(posList);
        if (posList.length > 0) setPointOfSaleId(posList[0].id);
      })
      .catch((e) => setError(e.message));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!merchandiseTypeId) {
      setError('Seleccione el tipo de mercancía');
      return;
    }
    setLoading(true);
    try {
      const res = await api.startAdmission({
        merchandiseData: { clientId, merchandiseTypeId },
        pointOfSaleId,
      });
      setResult({
        merchandiseId: res.merchandiseId,
        merchandiseTypeId: res.merchandiseTypeId,
        status: res.status,
        requiresDeprisacheck: res.requiresDeprisacheck,
      });
      if (res.status === 'rejected') {
        setError(res.rejectionReason || 'Admisión rechazada');
      }
      if (res.requiresDeprisacheck && res.merchandiseTypeId) {
        setTimeout(() => navigate(`/deprisacheck?merchandiseId=${res.merchandiseId}&merchandiseTypeId=${res.merchandiseTypeId}`), 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar admisión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <section className="page-header">
        <h1>Nueva Admisión</h1>
        <p>Inicie el proceso de admisión de mercancía seleccionando cliente, tipo y punto de venta.</p>
      </section>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          ID Cliente
          <input
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
          />
        </label>
        <label>
          Tipo de mercancía
          <select
            value={merchandiseTypeId}
            onChange={(e) => setMerchandiseTypeId(e.target.value)}
            required
          >
            <option value="">-- Seleccione --</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.requiresChecklist ? '(Requiere DeprisaCheck)' : ''}
              </option>
            ))}
          </select>
        </label>
        <label>
          Punto de venta
          <select value={pointOfSaleId} onChange={(e) => setPointOfSaleId(e.target.value)}>
            {posList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({(p.type === 'ato' || p.type === 'airport_ato') ? 'ATO' : 'Ciudad'})
              </option>
            ))}
          </select>
        </label>
        {error && <p className="error">{error}</p>}
        {result && (
          <div className="result-box">
            <p><strong>Estado:</strong> {result.status}</p>
            <p><strong>ID Mercancía:</strong> {result.merchandiseId}</p>
            {result.requiresDeprisacheck && (
              <p>Redirigiendo a DeprisaCheck...</p>
            )}
          </div>
        )}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Procesando...' : 'Iniciar admisión'}
        </button>
      </form>
    </div>
  );
}
