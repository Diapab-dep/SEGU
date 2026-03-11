import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type MerchandiseType } from '../api/client';

const POINTS_OF_SALE = [
  { id: 'pos-city-1', name: 'Punto Ciudad 1', type: 'city' },
  { id: 'pos-ato-1', name: 'Punto ATO 1', type: 'airport_ato' },
];

export function Admission() {
  const [types, setTypes] = useState<MerchandiseType[]>([]);
  const [clientId, setClientId] = useState('client-1');
  const [merchandiseTypeId, setMerchandiseTypeId] = useState('');
  const [pointOfSaleId, setPointOfSaleId] = useState('pos-city-1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ merchandiseId: string; merchandiseTypeId?: string; status: string; requiresDeprisacheck?: boolean } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.getMerchandiseTypes().then(setTypes).catch((e) => setError(e.message));
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
      <h1>Nueva Admisión</h1>
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
            {POINTS_OF_SALE.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.type})
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
        <button type="submit" disabled={loading}>
          {loading ? 'Procesando...' : 'Iniciar admisión'}
        </button>
      </form>
    </div>
  );
}
