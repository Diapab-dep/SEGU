import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, type ChecklistTemplate, type MerchandiseType } from '../api/client';

export function DeprisaCheck() {
  const [searchParams, setSearchParams] = useSearchParams();
  const merchandiseId = searchParams.get('merchandiseId');
  const merchandiseTypeIdParam = searchParams.get('merchandiseTypeId');
  const [types, setTypes] = useState<MerchandiseType[]>([]);
  const [manualMerchandiseId, setManualMerchandiseId] = useState('');
  const [manualTypeId, setManualTypeId] = useState('');
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [responses, setResponses] = useState<Record<string, string | boolean>>({});
  const [checklistId, setChecklistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.getMerchandiseTypes().then(setTypes).catch(console.error);
  }, []);

  useEffect(() => {
    const typeId = merchandiseTypeIdParam;
    if (merchandiseId && typeId) {
      setError('');
      api
        .getChecklistTemplates(typeId, 'ato')
        .then((t) => {
          setTemplates(t);
          if (t.length > 0 && !selectedTemplate) setSelectedTemplate(t[0]);
        })
        .catch((e) => setError(e.message));
    } else if (merchandiseId && !typeId) {
      setError('Falta tipo de mercancía. Inicie admisión desde Nueva Admisión o ingrese los datos abajo.');
    }
  }, [merchandiseId, merchandiseTypeIdParam]);

  const handleResponse = (itemId: string, value: string | boolean) => {
    setResponses((r) => ({ ...r, [itemId]: value }));
  };

  const handleSave = async () => {
    if (!merchandiseId || !selectedTemplate) return;
    setLoading(true);
    setError('');
    try {
      const created = await api.createChecklist({
        merchandiseId,
        templateId: selectedTemplate.id,
        responses,
      });
      setChecklistId(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!checklistId) {
      setError('Primero guarde la lista');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.submitChecklist(checklistId);
      setSubmitted(true);
      if (!res.accepted) setError('Lista incompleta o rechazada');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMerchandiseId.trim() || !manualTypeId) {
      setError('Ingrese el ID de mercancía y seleccione el tipo.');
      return;
    }
    setError('');
    setSearchParams({ merchandiseId: manualMerchandiseId.trim(), merchandiseTypeId: manualTypeId });
  };

  const typesRequiringChecklist = types.filter((t) => t.requiresChecklist);

  if (!merchandiseId) {
    return (
      <div className="page">
        <section className="page-header">
          <h1>DeprisaCheck — Lista de Comprobación</h1>
          <p>Ingrese el ID de mercancía y el tipo para cargar la lista de comprobación.</p>
        </section>
        {error && <p className="error">{error}</p>}
        <form className="form" onSubmit={handleLoadManual}>
          <label>
            ID Mercancía
            <input
              type="text"
              placeholder="Ej: uuid generado en admisión"
              value={manualMerchandiseId}
              onChange={(e) => setManualMerchandiseId(e.target.value)}
            />
          </label>
          <label>
            Tipo de mercancía (requiere DeprisaCheck)
            <select
              value={manualTypeId}
              onChange={(e) => setManualTypeId(e.target.value)}
              required
            >
              <option value="">-- Seleccione --</option>
              {typesRequiringChecklist.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn-primary">
            Cargar lista
          </button>
        </form>
        <p style={{ marginTop: 16, fontSize: '0.9em', color: '#666' }}>
          O inicie una admisión con mercancía peligrosa/especial en <strong>Nueva Admisión</strong> y será redirigido automáticamente.
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="page-header">
        <h1>DeprisaCheck — Lista de Comprobación</h1>
        <p>Diligencie la lista para la mercancía ID: <strong>{merchandiseId}</strong></p>
      </section>
      {error && <p className="error">{error}</p>}
      {submitted ? (
        <div className="result-box">
          <p>Proceso completado.</p>
        </div>
      ) : (
        <>
          {templates.length > 0 && (
            <div className="checklist-section">
              <h3>{selectedTemplate?.name}</h3>
              <div className="checklist-items">
                {selectedTemplate?.items.map((item) => (
                  <label key={item.id} className="checklist-item">
                    <span>{item.text} {item.required && '*'}</span>
                    <input
                      type="checkbox"
                      checked={!!responses[item.id]}
                      onChange={(e) => handleResponse(item.id, e.target.checked)}
                    />
                  </label>
                ))}
              </div>
              <div className="button-group">
                <button className="btn-primary" onClick={handleSave} disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar lista'}
                </button>
                {checklistId && (
                  <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                    Enviar para aceptación
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
